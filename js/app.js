/* IRON77 — app logic. Vanilla JS, no build step. All data lives in localStorage. */
(() => {
'use strict';

const KEY = 'iron77.v1';
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 86400000);
const fmtDate = (d) => new Date(d + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const progById = (id) => PROGRAMS.find((p) => p.id === id);

const CREED = [
  'Brief. Intense. Infrequent.',
  'The last reps are the ones that build the muscle.',
  'More is not better. Better is better.',
  'Growth happens in recovery, not in the gym.',
  'Master the basics, then shock the muscle.',
  'Nutrition is most of the battle.',
  'Proportion over bulk. Symmetry over size.',
  'Write it down. Beat the logbook.',
];

/* ---------- state ---------- */
const DEFAULT = {
  settings: { unit: 'lb', bodyweight: 180, diet: 'mentzer', goal: 'bulk', activity: 15 },
  activeProgram: 'heavy-duty',
  nextDay: {},
  sessions: [],
  current: null,
  food: {},
  stack: ['creatine', 'whey', 'liver'],
  stackLog: {},
};
let S;
try { S = Object.assign(structuredClone(DEFAULT), JSON.parse(localStorage.getItem(KEY) || '{}')); }
catch { S = structuredClone(DEFAULT); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

let view = 'today';
let viewArg = null;

/* ---------- training logic ---------- */
const upperReps = (reps) => {
  const m = String(reps).match(/(\d+)\s*$/);
  return m ? +m[1] : null;
};
const bestSet = (sets) => sets.filter((s) => +s.r > 0)
  .reduce((b, s) => (!b || +s.w > +b.w || (+s.w === +b.w && +s.r > +b.r) ? s : b), null);

function lastPerformance(name, beforeId) {
  for (let i = S.sessions.length - 1; i >= 0; i--) {
    const sess = S.sessions[i];
    if (sess.id === beforeId) continue;
    const ex = sess.exercises.find((e) => e.name === name);
    if (ex) { const b = bestSet(ex.sets); if (b) return { ...b, date: sess.date, sets: ex.sets }; }
  }
  return null;
}

// Did the session beat the previous log on each lift? (Mentzer's progress check)
function sessionProgress(sess) {
  let up = 0, total = 0;
  const idx = S.sessions.indexOf(sess);
  for (const ex of sess.exercises) {
    const cur = bestSet(ex.sets); if (!cur) continue;
    let prev = null;
    for (let i = idx - 1; i >= 0 && !prev; i--) {
      const e = S.sessions[i].exercises.find((x) => x.name === ex.name);
      if (e) prev = bestSet(e.sets);
    }
    if (!prev) continue;
    total++;
    if (+cur.w > +prev.w || (+cur.w === +prev.w && +cur.r > +prev.r)) up++;
  }
  return { up, total };
}

function recovery() {
  const prog = progById(S.activeProgram);
  const last = [...S.sessions].reverse().find((s) => s.programId === prog.id);
  if (!last) return { prog, ready: true, msg: 'No sessions logged yet. Time to begin.' };
  const since = daysBetween(last.date, today());
  let need = prog.restDays;
  const pr = sessionProgress(last);
  let stalled = false;
  if (prog.style === 'HIT' && pr.total > 0 && pr.up / pr.total < 0.5) { need += 1; stalled = true; }
  const left = need - since;
  return {
    prog, last, since, need, stalled, ready: left <= 0, left,
    msg: left <= 0
      ? `${since} day${since === 1 ? '' : 's'} since your last session. You're recovered.`
      : `${left} more rest day${left === 1 ? '' : 's'} recommended.`,
  };
}

const nextDayIdx = (prog) => (S.nextDay[prog.id] || 0) % prog.days.length;

function startSession(progId, dayIdx) {
  const prog = progById(progId);
  const day = prog.days[dayIdx];
  S.current = {
    id: uid(), date: today(), programId: prog.id, dayIdx, dayName: day.name,
    exercises: day.exercises.map((ex) => {
      const last = lastPerformance(ex.name);
      return {
        name: ex.name, target: `${ex.sets} × ${ex.reps}`, reps: ex.reps, ss: !!ex.ss, note: ex.note || '',
        sets: Array.from({ length: ex.sets }, () => ({ w: last ? last.w : '', r: '', done: false })),
      };
    }),
  };
  save(); go('session');
}

function finishSession() {
  const c = S.current;
  c.exercises.forEach((e) => { e.sets = e.sets.filter((s) => s.done || +s.r > 0).map(({ w, r }) => ({ w, r })); });
  c.exercises = c.exercises.filter((e) => e.sets.length);
  if (c.exercises.length) {
    S.sessions.push({ id: c.id, date: c.date, programId: c.programId, dayName: c.dayName, exercises: c.exercises.map(({ name, sets }) => ({ name, sets })) });
    const prog = progById(c.programId);
    S.nextDay[c.programId] = (c.dayIdx + 1) % prog.days.length;
  }
  S.current = null; save(); stopTimer(); go('today');
  if (c.exercises.length) toast('Session logged. Now go eat and rest.');
}

/* ---------- nutrition logic ---------- */
function targets() {
  const st = S.settings;
  const bwLb = st.unit === 'kg' ? st.bodyweight * 2.2046 : +st.bodyweight;
  const diet = DIETS.find((d) => d.id === st.diet) || DIETS[0];
  const goal = GOALS.find((g) => g.id === st.goal) || GOALS[0];
  const kcal = Math.round(bwLb * st.activity + goal.kcal);
  let p, c, f;
  if (diet.proteinPerLb) {
    p = bwLb * diet.proteinPerLb; f = (kcal * diet.pct.f) / 9; c = Math.max(0, (kcal - p * 4 - f * 9) / 4);
  } else {
    p = (kcal * diet.pct.p) / 4; c = (kcal * diet.pct.c) / 4; f = (kcal * diet.pct.f) / 9;
  }
  return { kcal, p: Math.round(p), c: Math.round(c), f: Math.round(f), diet, goal };
}
const kcalOf = (x) => Math.round(x.p * 4 + x.c * 4 + x.f * 9);
function eaten(date = today()) {
  const list = S.food[date] || [];
  return list.reduce((a, x) => ({ p: a.p + +x.p, c: a.c + +x.c, f: a.f + +x.f, kcal: a.kcal + kcalOf(x) }), { p: 0, c: 0, f: 0, kcal: 0 });
}

/* ---------- rest timer ---------- */
let timer = null;
function startTimer(sec) {
  stopTimer();
  const end = Date.now() + sec * 1000;
  const bar = $('#timer');
  bar.hidden = false;
  const tick = () => {
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    bar.querySelector('.t').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    if (left <= 0) { stopTimer(); navigator.vibrate?.([200, 100, 200]); toast('Rest over. Next set.'); }
  };
  tick(); timer = setInterval(tick, 250);
}
function stopTimer() { clearInterval(timer); timer = null; const b = $('#timer'); if (b) b.hidden = true; }
const restFor = (prog) => ({ HIT: 120, Strength: 180, Classic: 90, Volume: 75, Density: 30 }[prog.style] || 90);

/* ---------- views ---------- */
const bar = (label, val, max, unit = 'g') => {
  const pct = max ? Math.min(100, (val / max) * 100) : 0;
  return `<div class="bar"><div class="bar-l"><span>${label}</span><span>${Math.round(val)} / ${max}${unit}</span></div>
    <div class="bar-t"><div class="bar-f${val > max ? ' over' : ''}" style="width:${pct}%"></div></div></div>`;
};
const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC = {
  back: svg('<path d="M15 18l-6-6 6-6"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  timer: svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>'),
  check: svg('<path d="M20 6L9 17l-5-5"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
};
const ring = (label, val, max, unit = 'g') => {
  const pct = max ? Math.min(1, val / max) : 0, C = 2 * Math.PI * 26;
  return `<div class="ring${val > max ? ' over' : ''}"><div class="rw"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" class="rt"/>
    <circle cx="32" cy="32" r="26" class="rf" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>
    <b>${Math.round(val)}</b></div><span>${label}</span><em>of ${max}${unit}</em></div>`;
};
const evBadge = (e) => `<span class="badge ev-${e}">${{ strong: 'Strong evidence', moderate: 'Moderate', limited: 'Limited', none: 'No evidence' }[e]}</span>`;

const V = {};

V.today = () => {
  const r = recovery();
  const prog = r.prog;
  const di = nextDayIdx(prog);
  const day = prog.days[di];
  const t = targets(), e = eaten();
  const log = S.stackLog[today()] || [];
  const creed = CREED[new Date().getDate() % CREED.length];
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  return `
  <header class="top"><div><div class="brand"><svg class="mark" viewBox="0 0 300 242" aria-hidden="true"><rect x="0" y="0" width="300" height="50" rx="8" fill="#33658C"/><rect x="32" y="64" width="236" height="50" rx="8" fill="#39B4F2"/><rect x="64" y="128" width="172" height="50" rx="8" fill="#E7E7E1"/><rect x="96" y="192" width="108" height="50" rx="8" fill="#E8343B"/></svg><b>IRON<span>77</span></b></div><h1>${greet}</h1><div class="muted">${esc(fmtDate(today()))}</div></div>
    <button class="icon" data-act="go" data-v="settings" aria-label="Settings">${IC.gear}</button></header>
  <p class="creed">“${esc(creed)}”</p>

  ${S.current ? `<section class="card hot"><div class="kicker">In progress</div><h2>${esc(S.current.dayName)}</h2>
    <button class="btn" data-act="go" data-v="session">Resume Workout</button></section>` : ''}

  <section class="card hero">
    <div class="row between"><div class="kicker">${esc(prog.name)}</div><span class="badge ${r.ready ? 'ok' : 'wait'}">${r.ready ? 'READY' : 'RECOVERING'}</span></div>
    <h2>Next: ${esc(day.name)}</h2>
    <p class="muted">${esc(r.msg)}${r.stalled ? ' Your last session didn’t beat the logbook on most lifts, so one extra rest day has been added, as Mentzer prescribed.' : ''}</p>
    <ol class="exlist">${day.exercises.map((x) => `<li><span>${x.ss ? '⇄ ' : ''}${esc(x.name)}</span><b>${x.sets}×${esc(x.reps)}</b></li>`).join('')}</ol>
    ${S.current ? '' : `<button class="btn" data-act="start" data-p="${prog.id}" data-d="${di}">${r.ready ? 'Start Workout' : 'Train Anyway'}</button>`}
  </section>

  <section class="card">
    <div class="row between"><h3>Fuel</h3><button class="link" data-act="go" data-v="fuel">Log food ${IC.arrow}</button></div>
    <div class="rings">${ring('kcal', e.kcal, t.kcal, '')}${ring('Protein', e.p, t.p)}${ring('Carbs', e.c, t.c)}${ring('Fat', e.f, t.f)}</div>
  </section>

  <section class="card">
    <div class="row between"><h3>Today's stack</h3><button class="link" data-act="go" data-v="stack">Edit ${IC.arrow}</button></div>
    ${S.stack.length ? S.stack.map((id) => {
      const s = SUPPLEMENTS.find((x) => x.id === id); if (!s) return '';
      return `<label class="check"><input type="checkbox" data-act="takesupp" data-id="${id}" ${log.includes(id) ? 'checked' : ''}><span>${esc(s.name)}</span></label>`;
    }).join('') : '<p class="muted">No supplements in your stack yet.</p>'}
  </section>`;
};

V.train = () => {
  const active = progById(S.activeProgram);
  const hist = [...S.sessions].reverse();
  return `
  <header class="top"><h1>Train</h1></header>
  <div class="kicker pad">Programs</div>
  ${PROGRAMS.map((p) => `
    <button class="card prog${p.id === active.id ? ' active' : ''}" data-act="go" data-v="program" data-arg="${p.id}">
      <div class="row between"><span class="kicker">${esc(p.legend)}</span><span class="badge">${esc(p.style)}</span></div>
      <h3>${esc(p.name)}</h3><p class="muted">${esc(p.freq)}</p>
      ${p.id === active.id ? '<span class="badge ok">ACTIVE</span>' : ''}
    </button>`).join('')}
  <div class="kicker pad">Logbook</div>
  ${hist.length ? hist.map((s) => {
    const pr = sessionProgress(s);
    return `<details class="card log"><summary><div><b>${esc(s.dayName)}</b> <span class="muted">· ${esc(fmtDate(s.date))}</span></div>
      ${pr.total ? `<span class="badge ${pr.up / pr.total >= 0.5 ? 'ok' : 'wait'}">${pr.up}/${pr.total} ↑</span>` : ''}</summary>
      ${s.exercises.map((e) => `<div class="row between small"><span>${esc(e.name)}</span><span>${e.sets.map((x) => `${esc(x.w)}×${esc(x.r)}`).join(', ')}</span></div>`).join('')}
      <button class="link danger" data-act="delsession" data-id="${s.id}">Delete session</button></details>`;
  }).join('') : '<p class="muted pad">No sessions yet. Your logbook starts with the first rep.</p>'}`;
};

V.program = (id) => {
  const p = progById(id);
  const isActive = S.activeProgram === p.id;
  return `
  <header class="top"><button class="icon" data-act="go" data-v="train" aria-label="Back">${IC.back}</button><h1 class="sm">${esc(p.name)}</h1></header>
  <section class="card">
    <div class="kicker">${esc(p.legend)} · ${esc(p.level)}</div>
    <p>${esc(p.summary)}</p>
    <p class="muted"><b>Frequency:</b> ${esc(p.freq)}</p>
    <ul class="rules">${p.principles.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    ${isActive ? '<span class="badge ok">ACTIVE PROGRAM</span>' : `<button class="btn" data-act="activate" data-id="${p.id}">Make Active Program</button>`}
  </section>
  ${p.days.map((d, i) => `<section class="card">
    <div class="row between"><h3>${esc(d.name)}</h3><button class="link" data-act="start" data-p="${p.id}" data-d="${i}">Start ${IC.arrow}</button></div>
    <ol class="exlist">${d.exercises.map((x) => `<li><span>${x.ss ? '⇄ ' : ''}${esc(x.name)}${x.note ? `<em>${esc(x.note)}</em>` : ''}</span><b>${x.sets}×${esc(x.reps)}</b></li>`).join('')}</ol>
  </section>`).join('')}`;
};

V.session = () => {
  const c = S.current;
  if (!c) return V.today();
  const prog = progById(c.programId);
  const unit = S.settings.unit;
  return `
  <header class="top"><div><div class="kicker">${esc(prog.name)}</div><h1 class="sm">${esc(c.dayName)}</h1></div>
    <button class="icon" data-act="timer" data-s="${restFor(prog)}" aria-label="Rest timer">${IC.timer}</button></header>
  ${c.exercises.map((ex, ei) => {
    const last = lastPerformance(ex.name);
    const top = upperReps(ex.reps);
    const hint = last && top && +last.r >= top ? `Last time you hit ${esc(last.r)} reps at ${esc(last.w)}. Add weight (about 5%).` : '';
    return `<section class="card ex">
      <div class="row between"><h3>${ex.ss ? '⇄ ' : ''}${esc(ex.name)}</h3><span class="badge">${esc(ex.target)}</span></div>
      ${ex.note ? `<p class="muted small">${esc(ex.note)}</p>` : ''}
      ${last ? `<p class="small muted">Last: ${esc(last.w)} ${unit} × ${esc(last.r)} · ${esc(fmtDate(last.date))}</p>` : ''}
      ${hint ? `<p class="small hint">↑ ${hint}</p>` : ''}
      <div class="sets">
        <div class="set head"><span>#</span><span>${unit}</span><span>reps</span><span></span></div>
        ${ex.sets.map((s, si) => `<div class="set${s.done ? ' done' : ''}">
          <span>${si + 1}</span>
          <input inputmode="decimal" data-act="setval" data-e="${ei}" data-s="${si}" data-k="w" value="${esc(s.w)}" aria-label="Weight">
          <input inputmode="numeric" data-act="setval" data-e="${ei}" data-s="${si}" data-k="r" value="${esc(s.r)}" aria-label="Reps">
          <button class="tick" data-act="donesset" data-e="${ei}" data-s="${si}" aria-label="Mark set done">${IC.check}</button>
        </div>`).join('')}
      </div>
      <button class="link" data-act="addset" data-e="${ei}">+ Add set</button>
    </section>`;
  }).join('')}
  <div class="stack-btns">
    <button class="btn" data-act="finish">Finish & Log</button>
    <button class="btn ghost" data-act="discard">Discard</button>
  </div>`;
};

V.fuel = () => {
  const st = S.settings, t = targets(), e = eaten();
  const list = S.food[today()] || [];
  return `
  <header class="top"><h1>Fuel</h1></header>
  <section class="card">
    <div class="kicker">Today</div>
    ${bar('Calories', e.kcal, t.kcal, '')}${bar('Protein', e.p, t.p)}${bar('Carbs', e.c, t.c)}${bar('Fat', e.f, t.f)}
    ${list.length ? `<ul class="foods">${list.map((x, i) => `<li><span>${esc(x.name)}<em>P${x.p} · C${x.c} · F${x.f} · ${kcalOf(x)} kcal</em></span><button class="x" data-act="delfood" data-i="${i}" aria-label="Remove">×</button></li>`).join('')}</ul>` : '<p class="muted">Nothing logged yet today.</p>'}
  </section>
  <section class="card">
    <div class="kicker">Golden-era staples</div>
    <div class="chips">${FOODS.map((f, i) => `<button class="chip" data-act="addstaple" data-i="${i}">${esc(f.name)}</button>`).join('')}</div>
    <form class="custom" data-act="addcustom">
      <input name="name" placeholder="Custom food" required>
      <div class="row"><input name="p" inputmode="numeric" placeholder="P g" required><input name="c" inputmode="numeric" placeholder="C g" required><input name="f" inputmode="numeric" placeholder="F g" required></div>
      <button class="btn ghost">Add</button>
    </form>
  </section>
  <section class="card">
    <div class="kicker">Your targets</div>
    <div class="grid2">
      <label>Bodyweight (${st.unit})<input data-act="setting" data-k="bodyweight" inputmode="decimal" value="${esc(st.bodyweight)}"></label>
      <label>Activity<select data-act="setting" data-k="activity">
        ${[[13, 'Light'], [15, 'Moderate'], [17, 'High']].map(([v, n]) => `<option value="${v}" ${+st.activity === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    </div>
    <div class="seg">${GOALS.map((g) => `<button class="${st.goal === g.id ? 'on' : ''}" data-act="setgoal" data-id="${g.id}">${g.name}</button>`).join('')}</div>
    <p class="big">${t.kcal} kcal · P ${t.p}g · C ${t.c}g · F ${t.f}g</p>
  </section>
  <div class="kicker pad">Approach</div>
  ${DIETS.map((d) => `<button class="card prog${st.diet === d.id ? ' active' : ''}" data-act="setdiet" data-id="${d.id}">
    <div class="kicker">${esc(d.who)}</div><h3>${esc(d.name)}</h3><p class="muted">${esc(d.desc)}</p></button>`).join('')}
  <p class="muted small pad">Targets are estimates. Adjust by ~200 kcal if your weight isn't moving in the direction you want after 2–3 weeks.</p>`;
};

let stackFilter = 'all';
V.stack = () => {
  const list = SUPPLEMENTS.filter((s) => stackFilter === 'all' || (stackFilter === 'era' ? s.era : !s.era));
  return `
  <header class="top"><h1>Stack</h1></header>
  <p class="muted pad">What the golden-era champions took, checked against what current research supports.</p>
  <div class="seg pad">${[['all', 'All'], ['era', 'Golden Era'], ['modern', 'Modern']].map(([k, n]) => `<button class="${stackFilter === k ? 'on' : ''}" data-act="stackfilter" data-k="${k}">${n}</button>`).join('')}</div>
  ${list.map((s) => `<section class="card">
    <div class="row between"><span class="kicker">${s.era ? 'Golden era' : 'Modern'} · ${esc(s.who)}</span></div>
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.purpose)}</p>
    <p class="muted small">${evBadge(s.evidence)} ${esc(s.note)}</p>
    <label class="check"><input type="checkbox" data-act="togglestack" data-id="${s.id}" ${S.stack.includes(s.id) ? 'checked' : ''}><span>In my daily stack</span></label>
  </section>`).join('')}
  <p class="muted small pad">This is not medical advice. Check with a doctor before starting supplements, especially if you take medication.</p>`;
};

V.legends = () => `
  <header class="top"><h1>Legends</h1></header>
  <p class="muted pad">Many champions of this era also used anabolic steroids. The training and eating principles below are what translate to natural lifters.</p>
  ${LEGENDS.map((l) => `<details class="card legend">
    <summary><div><div class="kicker">${esc(l.nick)} · ${esc(l.years)}</div><h3>${esc(l.name)}</h3></div><span class="chev">+</span></summary>
    <ul class="titles">${l.titles.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    <h4>Philosophy</h4><p>${esc(l.philosophy)}</p>
    <h4>Training</h4><p>${esc(l.training)}</p>
    <h4>Diet</h4><p>${esc(l.diet)}</p>
    <button class="btn ghost" data-act="go" data-v="program" data-arg="${l.program}">Train in his style</button>
  </details>`).join('')}`;

V.settings = () => `
  <header class="top"><button class="icon" data-act="go" data-v="today" aria-label="Back">${IC.back}</button><h1 class="sm">Settings</h1></header>
  <section class="card">
    <div class="kicker">Units</div>
    <div class="seg">${['lb', 'kg'].map((u) => `<button class="${S.settings.unit === u ? 'on' : ''}" data-act="setunit" data-u="${u}">${u}</button>`).join('')}</div>
    <p class="muted small">Changing units relabels your logs. It does not convert past numbers.</p>
  </section>
  <section class="card">
    <div class="kicker">Your data</div>
    <p class="muted small">Everything is stored on this device only. Export a backup now and then.</p>
    <div class="stack-btns">
      <button class="btn ghost" data-act="export">Export backup</button>
      <label class="btn ghost file">Import backup<input type="file" accept="application/json" data-act="import" hidden></label>
      <button class="btn ghost danger" data-act="reset">Erase all data</button>
    </div>
  </section>`;

/* ---------- render & routing ---------- */
function render() {
  $('#view').innerHTML = (V[view] || V.today)(viewArg);
  document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('on', b.dataset.v === view || (view === 'program' && b.dataset.v === 'train') || (view === 'session' && b.dataset.v === 'train')));
}
function go(v, arg = null) { view = v; viewArg = arg; render(); window.scrollTo(0, 0); }

let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- events ---------- */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]'); if (!el) return;
  const d = el.dataset;
  switch (d.act) {
    case 'go': go(d.v, d.arg || null); break;
    case 'start':
      if (S.current && !confirm('A workout is already in progress. Replace it?')) return;
      startSession(d.p, +d.d); break;
    case 'activate': S.activeProgram = d.id; save(); toast('Program activated.'); render(); break;
    case 'addset': {
      const ex = S.current.exercises[+d.e]; const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets.push({ w: lastSet ? lastSet.w : '', r: '', done: false }); save(); render(); break;
    }
    case 'donesset': {
      const s = S.current.exercises[+d.e].sets[+d.s]; s.done = !s.done; save(); render();
      if (s.done) { const p = progById(S.current.programId); startTimer(restFor(p)); }
      break;
    }
    case 'timer': timer ? stopTimer() : startTimer(+d.s); break;
    case 'stoptimer': stopTimer(); break;
    case 'finish': finishSession(); break;
    case 'discard': if (confirm('Discard this workout?')) { S.current = null; save(); stopTimer(); go('today'); } break;
    case 'delsession': if (confirm('Delete this session from your logbook?')) { S.sessions = S.sessions.filter((s) => s.id !== d.id); save(); render(); } break;
    case 'addstaple': { const f = FOODS[+d.i]; (S.food[today()] ||= []).push({ ...f }); save(); render(); toast(`Added ${f.name}`); break; }
    case 'delfood': S.food[today()].splice(+d.i, 1); save(); render(); break;
    case 'setgoal': S.settings.goal = d.id; save(); render(); break;
    case 'setdiet': S.settings.diet = d.id; save(); render(); break;
    case 'stackfilter': stackFilter = d.k; render(); break;
    case 'setunit': S.settings.unit = d.u; save(); render(); break;
    case 'export': {
      const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `iron77-backup-${today()}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000); break;
    }
    case 'reset': if (confirm('Erase ALL logs, food and settings? This cannot be undone.')) { S = structuredClone(DEFAULT); save(); go('today'); } break;
  }
});

document.addEventListener('change', (ev) => {
  const el = ev.target; const d = el.dataset;
  if (d.act === 'takesupp') {
    const arr = (S.stackLog[today()] ||= []);
    if (el.checked) { if (!arr.includes(d.id)) arr.push(d.id); } else S.stackLog[today()] = arr.filter((x) => x !== d.id);
    save();
  } else if (d.act === 'togglestack') {
    S.stack = el.checked ? [...new Set([...S.stack, d.id])] : S.stack.filter((x) => x !== d.id); save();
  } else if (d.act === 'setting') {
    const v = parseFloat(el.value); if (!isNaN(v) && v > 0) { S.settings[d.k] = v; save(); render(); }
  } else if (d.act === 'setval') {
    S.current.exercises[+d.e].sets[+d.s][d.k] = el.value.trim(); save();
  } else if (d.act === 'import') {
    const file = el.files[0]; if (!file) return;
    file.text().then((txt) => {
      const data = JSON.parse(txt);
      if (!data || !Array.isArray(data.sessions)) throw new Error('bad');
      S = Object.assign(structuredClone(DEFAULT), data); save(); toast('Backup restored.'); go('today');
    }).catch(() => toast('That file is not an IRON77 backup.'));
  }
});

document.addEventListener('submit', (ev) => {
  const form = ev.target; if (form.dataset.act !== 'addcustom') return;
  ev.preventDefault();
  const fd = new FormData(form);
  const item = { name: fd.get('name').trim(), p: +fd.get('p') || 0, c: +fd.get('c') || 0, f: +fd.get('f') || 0 };
  if (!item.name) return;
  (S.food[today()] ||= []).push(item); save(); render(); toast(`Added ${item.name}`);
});

if (S.current) view = 'session';
render();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
