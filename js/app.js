/* IRON77 — app logic. Vanilla JS, no build step. All data lives in localStorage. */
(() => {
'use strict';

const KEY = 'iron77.v1';
const APP_VERSION = '12'; // keep in step with VERSION in sw.js
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
  calc: null,
  settings: { unit: 'lb', bodyweight: 180, diet: 'mentzer', goal: 'bulk', activity: 15 },
  activeProgram: 'heavy-duty',
  nextDay: {},
  sessions: [],
  current: null,
  food: {},
  stack: ['creatine', 'whey', 'liver'],
  stackLog: {},
  equipment: EQUIPMENT.map(([k]) => k).filter((k) => k !== 'nautilus'),
  equipSet: false,
  swaps: {},
  compounds: [],
  doses: [],
  weights: [],
  supplies: [],
};
let S;
try { S = Object.assign(structuredClone(DEFAULT), JSON.parse(localStorage.getItem(KEY) || '{}')); }
catch { S = structuredClone(DEFAULT); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
// Migrate renamed exercises so logbook history still matches.
{
  const mig = (n) => EX_ALIASES[n] || n;
  S.sessions.forEach((x) => x.exercises.forEach((e) => { e.name = mig(e.name); }));
  if (S.current) S.current.exercises.forEach((e) => { e.name = mig(e.name); });
}

/* ---------- exercises & equipment ---------- */
const lib = (n) => EXERCISES[n];
const equipName = (k) => (EQUIPMENT.find(([id]) => id === k) || [k, k])[1];
const missingFor = (n) => (lib(n) ? lib(n)[1].filter((k) => !S.equipment.includes(k)) : []);
const canDo = (n) => missingFor(n).length === 0;
// What the athlete will actually do for a programmed exercise, given swaps and equipment.
function resolveEx(name) {
  const sw = S.swaps[name];
  if (sw && canDo(sw)) return { name: sw, from: name, why: 'your swap' };
  if (canDo(name)) return { name };
  const alt = ((lib(name) || [])[2] || []).find(canDo);
  return alt ? { name: alt, from: name, why: 'no ' + missingFor(name).map(equipName).join(', ').toLowerCase() } : { name, missing: true };
}
const exLabel = (x, extra = '') => {
  const r = resolveEx(x.name);
  return `<span><button class="exname" data-act="demo" data-n="${esc(r.name)}">${x.ss ? '⇄ ' : ''}${esc(r.name)}</button>`
    + (r.from ? `<em>↺ instead of ${esc(r.from)} (${esc(r.why)})</em>` : '')
    + (r.missing ? `<em class="warn">Needs ${esc(missingFor(r.name).map(equipName).join(', '))}</em>` : '')
    + extra + '</span>';
};
const ytURL = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);

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
      const res = resolveEx(ex.name);
      const last = lastPerformance(res.name);
      return {
        name: res.name, from: res.from || '', target: `${ex.sets} × ${ex.reps}`, reps: ex.reps, ss: !!ex.ss, note: ex.note || '',
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
  play: svg('<path d="M7 4l13 8-13 8z" fill="currentColor" stroke="none"/>'),
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
    <ol class="exlist">${day.exercises.map((x) => `<li>${exLabel(x)}<b>${x.sets}×${esc(x.reps)}</b></li>`).join('')}</ol>
    ${S.current ? '' : `<button class="btn" data-act="start" data-p="${prog.id}" data-d="${di}">${r.ready ? 'Start Workout' : 'Train Anyway'}</button>`}
  </section>

  <section class="card">
    <div class="row between"><h3>Fuel</h3><button class="link" data-act="go" data-v="fuel">Log food ${IC.arrow}</button></div>
    <div class="rings">${ring('kcal', e.kcal, t.kcal, '')}${ring('Protein', e.p, t.p)}${ring('Carbs', e.c, t.c)}${ring('Fat', e.f, t.f)}</div>
  </section>

  <section class="card">
    <div class="row between"><h3>Today's protocol</h3><button class="link" data-act="go" data-v="stack">Manage ${IC.arrow}</button></div>
    ${S.compounds.length ? protocolToday() : '<p class="muted small">Add your supplements, peptides and medications under Stack → My protocol.</p>'}
  </section>`;
};

V.train = () => {
  const active = progById(S.activeProgram);
  const hist = [...S.sessions].reverse();
  return `
  <header class="top"><h1>Train</h1></header>
  <div class="tools">
    <button class="card tool${S.equipSet ? '' : ' hot'}" data-act="go" data-v="equipment">
      <h3>My gym</h3><p class="muted small">${S.equipSet ? `${S.equipment.length} of ${EQUIPMENT.length} equipment types` : 'Tell IRON77 what your gym has'}</p></button>
    <button class="card tool" data-act="go" data-v="library">
      <h3>Exercises</h3><p class="muted small">${Object.keys(EXERCISES).length} movements: form cues & demos</p></button>
  </div>
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
    <ol class="exlist">${d.exercises.map((x) => `<li>${exLabel(x, x.note ? `<em>${esc(x.note)}</em>` : '')}<b>${x.sets}×${esc(x.reps)}</b></li>`).join('')}</ol>
    <p class="muted small">Tap an exercise for form cues and demos.</p>
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
      <div class="row between"><h3><button class="exname" data-act="demo" data-n="${esc(ex.name)}" data-e="${ei}">${ex.ss ? '⇄ ' : ''}${esc(ex.name)} <i class="info">ⓘ</i></button></h3><span class="badge">${esc(ex.target)}</span></div>
      ${ex.from ? `<p class="muted small">↺ Instead of ${esc(ex.from)}</p>` : ''}
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
  <button class="btn ghost" data-act="addex">+ Add Exercise</button>
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
const exRows = (onclick) => {
  const groups = {};
  for (const [n, e] of Object.entries(EXERCISES)) (groups[e[0]] ||= []).push(n);
  return Object.entries(groups).map(([g, names]) => `<div class="kicker pad">${esc(g)}</div><div class="card list">
    ${names.map((n) => `<button class="exrow" data-act="${onclick}" data-n="${esc(n)}" data-search="${esc((n + ' ' + g).toLowerCase())}">
      <span>${esc(n)}</span>${canDo(n) ? '' : `<span class="badge">Needs ${esc(missingFor(n).map(equipName).join(', '))}</span>`}</button>`).join('')}</div>`).join('');
};

V.library = () => `
  <header class="top"><button class="icon" data-act="go" data-v="train" aria-label="Back">${IC.back}</button><h1 class="sm">Exercises</h1></header>
  <input class="search" type="search" placeholder="Search exercises" data-act="exsearch" aria-label="Search exercises">
  <div class="searchable">${exRows('demo')}</div>`;

V.equipment = () => `
  <header class="top"><button class="icon" data-act="go" data-v="train" aria-label="Back">${IC.back}</button><h1 class="sm">My gym</h1></header>
  <p class="muted pad">Tick what your gym has. When a program calls for equipment you don't have, IRON77 swaps in the closest movement you can do. Tick it again when you move gyms and the original comes back.</p>
  <section class="card">${EQUIPMENT.map(([k, n]) => `<label class="check"><input type="checkbox" data-act="equip" data-k="${k}" ${S.equipment.includes(k) ? 'checked' : ''}><span>${esc(n)}</span></label>`).join('')}</section>
  ${Object.keys(S.swaps).length ? `<section class="card"><h3>Your swaps</h3>
    ${Object.entries(S.swaps).map(([a, b]) => `<div class="row between small swaprow"><span>${esc(a)} → <b>${esc(b)}</b></span><button class="link danger" data-act="unswap" data-n="${esc(a)}">Remove</button></div>`).join('')}</section>` : ''}`;

/* ---------- bottom sheet: exercise demo / add exercise ---------- */
function openSheet(html) {
  const sh = $('#sheet');
  sh.querySelector('.sheet-body').innerHTML = html;
  sh.hidden = false; document.body.classList.add('locked');
  sh.querySelector('.sheet-body').scrollTop = 0;
}
function closeSheet() { $('#sheet').hidden = true; document.body.classList.remove('locked'); }

function demoSheet(name, ei) {
  const e = lib(name);
  const inSession = ei != null && S.current && S.current.exercises[ei];
  const cur = inSession ? S.current.exercises[ei] : null;
  const original = cur ? (cur.from || cur.name) : null;
  let alts = e ? [...e[2]] : [];
  if (cur && cur.from && !alts.includes(cur.from)) alts.unshift(cur.from);
  if (cur) alts = alts.filter((a) => a !== cur.name);
  const miss = missingFor(name);
  return `
    <div class="kicker">${e ? esc(e[0]) : 'Custom exercise'}${e && e[1].length ? ' · ' + esc(e[1].map(equipName).join(', ')) : e ? ' · Bodyweight' : ''}</div>
    <h2>${esc(name)}</h2>
    ${miss.length ? `<p class="warn small">Your gym doesn't have: ${esc(miss.map(equipName).join(', '))}</p>` : ''}
    ${e ? `<h4>How to do it</h4><ol class="cues">${e[3].map((c) => `<li>${esc(c)}</li>`).join('')}</ol>` : ''}
    <h4>Watch</h4>
    <div class="vids">
      <a class="btn ghost" href="${ytURL((e && e[4]) || 'golden era bodybuilding ' + name)}" target="_blank" rel="noopener">${IC.play} Classic footage</a>
      <a class="btn ghost" href="${ytURL(name + ' proper form')}" target="_blank" rel="noopener">${IC.play} Form tutorial</a>
    </div>
    <p class="muted small">Opens a YouTube search. Results are other people's videos, so quality varies.</p>
    ${alts.length ? `<h4>${cur ? 'Swap for' : 'Alternatives'}</h4><div class="card list inset">
      ${alts.map((a) => `<div class="exrow"><button class="exname" data-act="demo" data-n="${esc(a)}"${cur ? ` data-e="${ei}"` : ''}>${esc(a)}${a === (cur && cur.from) ? ' <em>(original)</em>' : ''}</button>
        ${!canDo(a) ? `<span class="badge">Needs ${esc(missingFor(a).map(equipName).join(', '))}</span>` : cur ? `<button class="link" data-act="swapex" data-e="${ei}" data-to="${esc(a)}">Swap in</button>` : ''}</div>`).join('')}</div>
      ${cur && !cur.added ? `<p class="muted small">Swaps are remembered: next time, ${esc(original)} will be replaced too. Undo under Train → My gym.</p>` : ''}` : ''}
    ${cur && cur.name !== name && !cur.added ? `<button class="btn" data-act="swapex" data-e="${ei}" data-to="${esc(name)}"${canDo(name) ? '' : ' disabled'}>Swap ${esc(cur.name)} for this</button>` : ''}
    ${cur && cur.name === name ? `<button class="btn ghost danger" data-act="removeex" data-e="${ei}">Remove from this workout</button>` : ''}`;
}

function addSheet() {
  return `<h2>Add exercise</h2>
    <input class="search" type="search" placeholder="Search exercises" data-act="exsearch" aria-label="Search exercises">
    <div class="searchable">${exRows('addpick')}</div>
    <h4>Not listed?</h4>
    <form class="custom" data-act="addcustomex"><input name="name" placeholder="Custom exercise name" required><button class="btn ghost">Add custom</button></form>`;
}

function swapExercise(ei, to) {
  const ex = S.current.exercises[ei];
  const original = ex.from || ex.name;
  ex.name = to;
  ex.from = to === original ? '' : original;
  if (!ex.added) { if (to === original) delete S.swaps[original]; else S.swaps[original] = to; }
  const last = lastPerformance(to);
  ex.sets.forEach((st) => { if (!st.done) st.w = last ? last.w : ''; });
  save(); closeSheet(); render();
  toast(to === original ? `Back to ${to}.` : `Swapped to ${to}.`);
}

function addExercise(name) {
  const prog = progById(S.current.programId);
  const n = prog.style === 'HIT' ? 1 : 3, reps = prog.style === 'HIT' ? '6-10' : '8-12';
  const last = lastPerformance(name);
  S.current.exercises.push({ name, from: '', target: `${n} × ${reps}`, reps, ss: false, note: '', added: true,
    sets: Array.from({ length: n }, () => ({ w: last ? last.w : '', r: '', done: false })) });
  save(); closeSheet(); render(); toast(`Added ${name}.`);
  setTimeout(() => document.querySelectorAll('.card.ex')[S.current.exercises.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
}

V.settings = () => `
  <header class="top"><button class="icon" data-act="go" data-v="today" aria-label="Back">${IC.back}</button><h1 class="sm">Settings</h1></header>
  <section class="card">
    <div class="kicker">Units</div>
    <div class="seg">${['lb', 'kg'].map((u) => `<button class="${S.settings.unit === u ? 'on' : ''}" data-act="setunit" data-u="${u}">${u}</button>`).join('')}</div>
    <p class="muted small">Changing units relabels your logs. It does not convert past numbers.</p>
  </section>
  <button class="card tool" data-act="opencalc">
    <div class="row between"><h3>Reconstitution & dose calculator</h3>${IC.arrow}</div>
    <p class="muted small">Vial + water + dose → how many units to draw.</p>
  </button>
  <section class="card">
    <div class="row between"><div class="kicker">App version</div><span class="badge">v${APP_VERSION}</span></div>
    <p class="muted small">IRON77 updates itself when you open it with signal. If something looks out of date, force a refresh. Your logs aren't affected.</p>
    <button class="btn ghost" data-act="forceupdate">Check for updates</button>
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

/* ---------- protocol: compounds, doses, bodyweight ---------- */
const ROUTES = ['SubQ', 'IM', 'Oral', 'Topical', 'Other'];
const UNITS = ['mg', 'mcg', 'IU', 'g', 'ml', 'units', 'caps', 'tabs'];
const KINDS = [['peptide', 'Peptide'], ['hormone', 'Hormone'], ['supplement', 'Supplement'], ['medication', 'Medication']];
const SITES = {
  SubQ: ['Abdomen L', 'Abdomen R', 'Thigh L', 'Thigh R', 'Love handle L', 'Love handle R'],
  IM: ['Glute L', 'Glute R', 'Delt L', 'Delt R', 'Quad L', 'Quad R', 'Ventroglute L', 'Ventroglute R'],
};
const SCHEDS = [['1', 'Every day'], ['2', 'Every other day'], ['3', 'Every 3 days'], ['7', 'Once a week'], ['14', 'Every 2 weeks'], ['wd', 'Specific weekdays'], ['n', 'Every N days'], ['prn', 'As needed']];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const isInj = (c) => c.route === 'SubQ' || c.route === 'IM';

const dateAdd = (d, n) => { const x = new Date(d + 'T12:00'); x.setDate(x.getDate() + n); return x.toLocaleDateString('en-CA'); };
const dow = (d) => new Date(d + 'T12:00').getDay();
const fmtShort = (d) => { const x = new Date(d + 'T12:00'); return `${x.toLocaleDateString(undefined, { weekday: 'short' })} ${x.getDate()}`; };
const nowTime = () => new Date().toTimeString().slice(0, 5);
const fmtNum = (n) => (Math.round(n * 100) / 100).toString();

// One-time migration: old guide checkboxes become protocol items.
if (!S.protoMigrated) {
  S.compounds ||= []; S.doses ||= []; S.weights ||= [];
  for (const id of S.stack || []) {
    const sup = SUPPLEMENTS.find((x) => x.id === id); if (!sup) continue;
    const cid = uid();
    S.compounds.push({ id: cid, guide: id, name: sup.name, kind: 'supplement', dose: '', unit: '', route: 'Oral', sched: { type: 'interval', every: 1 }, time: '08:00', start: today(), end: '', mix: { type: 'none' }, supply: '', perVial: '', notes: '' });
    if ((S.stackLog[today()] || []).includes(id)) S.doses.push({ id: uid(), cid, date: today(), time: '08:00', amount: '', unit: '', site: '', note: '' });
  }
  S.stack = []; S.protoMigrated = true; save();
}
S.compounds ||= []; S.doses ||= []; S.weights ||= []; S.supplies ||= [];

const compById = (id) => S.compounds.find((c) => c.id === id);
const schedText = (c) => {
  const s = c.sched;
  if (s.type === 'prn') return 'As needed';
  if (s.type === 'weekdays') return s.days.length === 7 ? 'Every day' : s.days.map((i) => DOW[i]).join(', ');
  return ({ 1: 'Every day', 2: 'Every other day', 7: 'Once a week', 14: 'Every 2 weeks' })[s.every] || `Every ${s.every} days`;
};
const doseText = (c, amt = c.dose) => (amt !== '' && amt != null ? `${fmtNum(+amt)} ${c.unit}`.trim() : '');
function isDue(c, d) {
  if (c.paused || d < c.start || (c.end && d > c.end)) return false;
  const s = c.sched;
  if (s.type === 'prn') return false;
  if (s.type === 'weekdays') return s.days.includes(dow(d));
  return daysBetween(c.start, d) % Math.max(1, s.every) === 0;
}
const dosesOn = (cid, d) => S.doses.filter((x) => x.cid === cid && x.date === d);
const lastDose = (cid) => S.doses.filter((x) => x.cid === cid).sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))[0];
function nextDue(c, from = today()) { for (let i = 0; i < 400; i++) { const d = dateAdd(from, i); if (isDue(c, d)) return d; } return null; }
function missedOn(c) {
  for (let i = 1; i <= 30; i++) {
    const d = dateAdd(today(), -i);
    if (d < c.start) return null;
    if (isDue(c, d)) return dosesOn(c.id, d).length ? null : d;
  }
  return null;
}
function adherence(c, days = 28) {
  let due = 0, hit = 0;
  for (let i = 0; i < days; i++) {
    const d = dateAdd(today(), -i);
    if (!isDue(c, d)) continue;
    const taken = dosesOn(c.id, d).length > 0;
    if (i === 0 && !taken) continue; // today isn't missed yet
    due++; if (taken) hit++;
  }
  return due ? Math.round((hit / due) * 100) : null;
}
const perWeek = (c) => (c.sched.type === 'prn' ? 0 : c.sched.type === 'weekdays' ? c.sched.days.length : 7 / Math.max(1, c.sched.every));
function runwayDays(c) {
  if (c.supply === '' || c.supply == null || !(+c.dose > 0) || !perWeek(c)) return null;
  return Math.floor((+c.supply / (+c.dose * perWeek(c))) * 7);
}
const concOf = (c) => (c.mix?.type === 'premix' ? +c.mix.conc : c.mix?.type === 'recon' && +c.mix.water > 0 ? +c.mix.vial / +c.mix.water : 0);
/* syringe supplies */
const SYR_SIZES = { insulin: ['0.3', '0.5', '1'], ml: ['1', '3', '5', '10'] };
const syrById = (id) => S.supplies.find((x) => x.id === id);
const syrName = (x) => (x.type === 'insulin' ? `${fmtNum(+x.size)} ml insulin (U-100)` : `${fmtNum(+x.size)} ml syringe`);
const syrLabel = (x) => [syrName(x), x.gauge ? `${x.gauge}G` : '', x.length || ''].filter(Boolean).join(' · ');
const syrPerWeek = (x) => S.compounds.filter((c) => !c.paused && isInj(c) && c.syringe === x.id).reduce((a, c) => a + perWeek(c), 0);
const syrRunway = (x) => { const w = syrPerWeek(x); return w ? Math.floor((+x.count / w) * 7) : null; };
const syrLow = (x) => +x.count <= (+x.low || 0) || (syrRunway(x) != null && syrRunway(x) < 7);

function drawText(c, amt = c.dose) {
  const conc = concOf(c);
  if (!(conc > 0) || !(+amt > 0) || !isInj(c)) return '';
  const ml = +amt / conc, sy = syrById(c.syringe);
  if (sy && sy.type === 'ml') return `Draw ${fmtNum(ml)} ml${ml > +sy.size ? ` (more than your ${fmtNum(+sy.size)} ml syringe holds)` : ''}`;
  const u = ml * 100;
  return `Draw ${fmtNum(ml)} ml · ${fmtNum(u)} units (U-100)${sy && u > +sy.size * 100 ? ` (more than your ${fmtNum(+sy.size * 100)}-unit syringe holds: split it)` : ''}`;
}
function suggestSite(c) {
  const sites = SITES[c.route]; if (!sites) return '';
  const lastUse = {};
  S.doses.filter((x) => x.cid === c.id && x.site).forEach((x) => { const k = x.date + x.time; if (!lastUse[x.site] || k > lastUse[x.site]) lastUse[x.site] = k; });
  return [...sites].sort((a, b) => (lastUse[a] || '') < (lastUse[b] || '') ? -1 : (lastUse[a] || '') > (lastUse[b] || '') ? 1 : 0)[0];
}
function logDose(c, { amount = c.dose, site = isInj(c) ? suggestSite(c) : '', date = today(), time = nowTime(), note = '' } = {}) {
  const dose = { id: uid(), cid: c.id, date, time, amount, unit: c.unit, site, note };
  S.doses.push(dose);
  if (c.supply !== '' && c.supply != null && +amount > 0) c.supply = Math.max(0, +c.supply - +amount);
  const sy = isInj(c) && syrById(c.syringe);
  if (sy && +sy.count > 0) { sy.count = +sy.count - 1; dose.syringe = sy.id; }
  save(); return dose;
}
function removeDose(id) {
  const dose = S.doses.find((x) => x.id === id); if (!dose) return;
  const c = compById(dose.cid);
  if (c && c.supply !== '' && c.supply != null && +dose.amount > 0) c.supply = +c.supply + +dose.amount;
  const sy = dose.syringe && syrById(dose.syringe);
  if (sy) sy.count = +sy.count + 1;
  S.doses = S.doses.filter((x) => x.id !== id); save();
}
const kindColor = (k) => ({ peptide: 'var(--accent)', hormone: 'var(--red)', supplement: 'var(--ink)', medication: 'var(--steel)' })[k] || 'var(--label)';

/* --- Today list --- */
function protocolToday() {
  const d = today();
  const due = S.compounds.filter((c) => isDue(c, d));
  const missed = S.compounds.map((c) => [c, missedOn(c)]).filter(([, m]) => m);
  const soon = S.compounds.filter((c) => !c.paused && c.sched.type !== 'prn' && !isDue(c, d))
    .map((c) => [c, nextDue(c, dateAdd(d, 1))]).filter(([, n]) => n && daysBetween(d, n) <= 6)
    .sort((a, b) => (a[1] < b[1] ? -1 : 1));
  const row = (c) => {
    const taken = dosesOn(c.id, d);
    const t = taken[taken.length - 1];
    const sub = t
      ? [`Taken ${t.time}`, doseText(c, t.amount), t.site].filter(Boolean).join(' · ')
      : [doseText(c), c.route !== 'Oral' ? c.route : '', isInj(c) ? `Site: ${suggestSite(c)}` : '', drawText(c)].filter(Boolean).join(' · ');
    return `<div class="dose-row${t ? ' done' : ''}" style="--k:${kindColor(c.kind)}">
      <button class="dose-tick" data-act="${t ? 'untake' : 'quicklog'}" data-id="${c.id}" aria-label="${t ? 'Undo' : 'Log'} ${esc(c.name)}">${IC.check}</button>
      <button class="dose-main" data-act="compound" data-id="${c.id}"><b>${esc(c.name)}</b><span>${esc(sub || c.time || '')}</span></button>
    </div>`;
  };
  return `${due.length ? due.map(row).join('') : '<p class="muted small">Nothing scheduled today.</p>'}
    ${S.supplies.filter(syrLow).map((x) => `<p class="warn small missed">Low on syringes: ${fmtNum(+x.count)} left (${esc(syrLabel(x))}). <button class="link" data-act="supply" data-id="${x.id}">Restock</button></p>`).join('')}
    ${missed.map(([c, m]) => `<p class="warn small missed">Missed ${esc(c.name)} on ${esc(fmtDate(m))}. <button class="link" data-act="logmissed" data-id="${c.id}" data-d="${m}">Log it</button></p>`).join('')}
    ${soon.length ? `<p class="muted small soon">Coming up: ${soon.map(([c, n]) => `${esc(c.name)} ${DOW[dow(n)]}`).join(' · ')}</p>` : ''}`;
}

/* --- Bodyweight --- */
function weightChart() {
  const pts = [...S.weights].sort((a, b) => (a.date < b.date ? -1 : 1)).filter((x) => daysBetween(x.date, today()) <= 90);
  if (pts.length < 2) return '<p class="muted small">Log at least two weigh-ins to see your trend.</p>';
  const W = 320, H = 110, pad = 8;
  const t0 = pts[0].date, span = Math.max(1, daysBetween(t0, pts[pts.length - 1].date));
  const ws = pts.map((p) => +p.w), lo = Math.min(...ws), hi = Math.max(...ws), r = Math.max(1, hi - lo);
  const x = (p) => pad + (daysBetween(t0, p.date) / span) * (W - 2 * pad);
  const y = (p) => pad + (1 - (+p.w - lo) / r) * (H - 2 * pad);
  // dose markers for injectables, so weight trend can be read against the protocol
  const marks = S.doses.filter((d2) => { const c = compById(d2.cid); return c && isInj(c) && d2.date >= t0; })
    .map((d2) => `<line x1="${x(d2)}" x2="${x(d2)}" y1="${H - 2}" y2="${H - 8}" stroke="${kindColor(compById(d2.cid).kind)}" stroke-width="2"/>`).join('');
  return `<svg class="wchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bodyweight trend">
    ${marks}<polyline fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" points="${pts.map((p) => `${x(p)},${y(p)}`).join(' ')}"/>
    ${pts.map((p) => `<circle cx="${x(p)}" cy="${y(p)}" r="3" fill="var(--ink)"/>`).join('')}</svg>
    <div class="row between small muted"><span>${esc(fmtDate(t0))}</span><span>low ${fmtNum(lo)} · high ${fmtNum(hi)}</span></div>`;
}
function weightCard() {
  const sorted = [...S.weights].sort((a, b) => (a.date < b.date ? -1 : 1));
  const last = sorted[sorted.length - 1];
  const ago = sorted.filter((x) => daysBetween(x.date, today()) >= 28).pop();
  const delta = last && ago ? +last.w - +ago.w : null;
  const u = S.settings.unit;
  return `<section class="card">
    <div class="row between"><h3>Bodyweight</h3>${last ? `<span class="big-num">${fmtNum(+last.w)} <small>${u}</small></span>` : ''}</div>
    ${delta != null ? `<p class="small ${delta <= 0 ? 'hint' : 'muted'}">${delta > 0 ? '+' : ''}${fmtNum(delta)} ${u} over 4 weeks</p>` : ''}
    ${weightChart()}
    <form class="row wform" data-act="logweight"><input name="w" inputmode="decimal" placeholder="Today's weight (${u})" required><button class="btn ghost">Log</button></form>
    <p class="muted small">Your latest weigh-in also updates your Fuel targets. Ticks under the chart mark injection days.</p>
  </section>`;
}

/* --- Stack view --- */
let stackTab = 'protocol';
V.stack = () => `
  <header class="top"><h1>Stack</h1></header>
  <div class="seg">${[['protocol', 'My protocol'], ['guide', 'Supplement guide']].map(([k, n]) => `<button class="${stackTab === k ? 'on' : ''}" data-act="stacktab" data-k="${k}">${n}</button>`).join('')}</div>
  ${stackTab === 'protocol' ? V.protocol() : V.guide()}`;

V.protocol = () => `
  <section class="card" style="margin-top:14px"><div class="row between"><h3>Today</h3><span class="muted small">${esc(fmtDate(today()))}</span></div>${protocolToday()}</section>
  ${S.compounds.length ? `<div class="kicker pad">Compounds</div>` : ''}
  ${S.compounds.map((c) => {
    const nd = nextDue(c), ad = adherence(c), rw = runwayDays(c);
    return `<button class="card comp" data-act="compound" data-id="${c.id}" style="--k:${kindColor(c.kind)}">
      <div class="row between"><span class="kicker">${esc((KINDS.find(([k]) => k === c.kind) || ['', ''])[1])}${c.paused ? ' · Paused' : ''}</span>${ad != null ? `<span class="badge ${ad >= 80 ? 'ok' : 'wait'}">${ad}%</span>` : ''}</div>
      <h3>${esc(c.name)}</h3>
      <p class="muted small">${esc([doseText(c), c.route, schedText(c)].filter(Boolean).join(' · '))}</p>
      <div class="stats">
        <div><span>Next</span><b>${c.paused ? 'Paused' : nd ? (nd === today() ? 'Today' : esc(fmtShort(nd))) : '—'}</b></div>
        <div><span>Supply</span><b>${rw != null ? (rw < 7 ? `<i class="warn">${rw} days</i>` : `${Math.round(rw / 7)} wks`) : c.supply !== '' && c.supply != null ? `${fmtNum(+c.supply)} ${esc(c.unit)}` : '—'}</b></div>
        <div><span>Last</span><b>${lastDose(c.id) ? esc(fmtShort(lastDose(c.id).date)) : '—'}</b></div>
      </div>
    </button>`;
  }).join('')}
  <button class="btn" data-act="newcompound">+ Add compound</button>
  <div class="kicker pad">Supplies</div>
  ${S.supplies.map((x) => {
    const rw = syrRunway(x), users = S.compounds.filter((c) => c.syringe === x.id);
    return `<button class="card comp" data-act="supply" data-id="${x.id}" style="--k:var(--steel)">
      <div class="row between"><span class="kicker">${x.type === 'insulin' ? 'SubQ syringes' : 'IM syringes'}</span>${syrLow(x) ? '<span class="badge wait">Low</span>' : ''}</div>
      <h3>${esc(syrLabel(x))}</h3>
      <p class="muted small">${users.length ? 'Used for ' + users.map((c) => esc(c.name)).join(', ') : 'Not linked to a compound yet. Pick it in a compound\u2019s Syringe field.'}</p>
      <div class="stats">
        <div><span>On hand</span><b>${fmtNum(+x.count)}</b></div>
        <div><span>Lasts</span><b>${rw == null ? '—' : rw < 14 ? `${rw} days` : `${Math.round(rw / 7)} wks`}</b></div>
        <div><span>Per week</span><b>${fmtNum(syrPerWeek(x))}</b></div>
      </div></button>`;
  }).join('')}
  <button class="btn ghost" data-act="newsupply">+ Add syringes</button>
  <div class="kicker pad">Metrics</div>
  ${weightCard()}
  <button class="btn ghost" data-act="summary">Export summary for your doctor</button>
  <p class="muted small pad">IRON77 tracks what you enter. It doesn't recommend doses. Keep whoever prescribes your protocol in the loop, and get bloodwork on a regular schedule.</p>`;

V.guide = () => {
  const list = SUPPLEMENTS.filter((s) => stackFilter === 'all' || (stackFilter === 'era' ? s.era : !s.era));
  return `
  <p class="muted pad">What the golden-era champions took, checked against what current research supports.</p>
  <div class="seg pad">${[['all', 'All'], ['era', 'Golden Era'], ['modern', 'Modern']].map(([k, n]) => `<button class="${stackFilter === k ? 'on' : ''}" data-act="stackfilter" data-k="${k}">${n}</button>`).join('')}</div>
  ${list.map((s) => `<section class="card">
    <div class="row between"><span class="kicker">${s.era ? 'Golden era' : 'Modern'} · ${esc(s.who)}</span></div>
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.purpose)}</p>
    <p class="muted small">${evBadge(s.evidence)} ${esc(s.note)}</p>
    <label class="check"><input type="checkbox" data-act="togglestack" data-id="${s.id}" ${S.compounds.some((c) => c.guide === s.id) ? 'checked' : ''}><span>In my protocol</span></label>
  </section>`).join('')}
  <p class="muted small pad">This is not medical advice. Check with a doctor before starting supplements, especially if you take medication.</p>`;
};

/* --- Sheets --- */
const KIND_GROUPS = [['peptide', 'Peptides'], ['hormone', 'Hormones'], ['medication', 'Medications'], ['supplement', 'Supplements']];
function compoundPicker() {
  const have = new Set(S.compounds.map((c) => c.name.toLowerCase()));
  return `<h2>Add compound</h2>
    <input class="search" type="search" placeholder="Search ${COMPOUNDS.length} compounds, brands or slang" data-act="exsearch" aria-label="Search compounds" autocomplete="off">
    <div class="searchable">${KIND_GROUPS.map(([k, label]) => `<div class="kicker pad">${label}</div><div class="card list inset">
      ${COMPOUNDS.filter((x) => x[1] === k).map(([name, , route, unit, , aliases]) => `<button class="exrow" data-act="pickcompound" data-n="${esc(name)}" data-search="${esc((name + ' ' + aliases + ' ' + k).toLowerCase())}">
        <span>${esc(name)}<em> · ${esc(route)} · ${esc(unit)}</em></span>${have.has(name.toLowerCase()) ? '<span class="badge ok">Added</span>' : ''}</button>`).join('')}</div>`).join('')}</div>
    <h4>Not listed?</h4>
    <button class="btn ghost" data-act="customcompound" id="customcomp">Add a custom compound</button>`;
}

function compoundForm(c, hint = '') {
  const isNew = !c || !c.id;
  const oral = c && c.route && !['SubQ', 'IM'].includes(c.route);
  c = { name: '', kind: 'peptide', dose: '', unit: 'mg', route: 'SubQ', sched: { type: 'interval', every: oral ? 1 : 7 }, time: '08:00', start: today(), end: '', mix: { type: 'none' }, supply: '', perVial: '', notes: '', ...(c || {}) };
  const sk = c.sched.type === 'prn' ? 'prn' : c.sched.type === 'weekdays' ? 'wd' : ['1', '2', '3', '7', '14'].includes(String(c.sched.every)) ? String(c.sched.every) : 'n';
  const opt = (arr, v) => arr.map((o) => { const [val, label] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(label)}</option>`; }).join('');
  return `<h2>${isNew ? 'Add compound' : 'Edit compound'}</h2>
  ${hint ? `<p class="hint small">${esc(hint)}</p>` : ''}
  ${isNew ? '<button class="link" data-act="newcompound">← Back to search</button>' : ''}
  <form class="cform" data-act="savecompound" data-id="${c.id || ''}" data-sched="${sk}" data-mix="${c.mix?.type || 'none'}" data-route="${esc(c.route)}">
    <label>Name<input name="name" value="${esc(c.name)}" placeholder="e.g. Testosterone cypionate" required></label>
    <label>Type<select name="kind">${opt(KINDS, c.kind)}</select></label>
    <div class="grid2"><label>Dose<input name="dose" inputmode="decimal" value="${esc(c.dose)}" placeholder="Amount"></label>
      <label>Unit<select name="unit">${opt(UNITS, c.unit)}</select></label></div>
    <div class="grid2"><label>Route<select name="route" data-act="formsync">${opt(ROUTES, c.route)}</select></label>
      <label>Time<input name="time" type="time" value="${esc(c.time || '08:00')}"></label></div>
    <label>Schedule<select name="sched" data-act="formsync">${opt(SCHEDS, sk)}</select></label>
    <div class="f-wd wdays">${DOW.map((n, i) => `<label class="wd"><input type="checkbox" name="days" value="${i}" ${c.sched.type === 'weekdays' && c.sched.days.includes(i) ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div>
    <label class="f-n">Every how many days?<input name="every" inputmode="numeric" value="${esc(c.sched.type === 'interval' ? c.sched.every : 4)}"></label>
    <div class="grid2"><label>Start<input name="start" type="date" value="${esc(c.start)}" required></label>
      <label>End (optional)<input name="end" type="date" value="${esc(c.end || '')}"></label></div>
    <fieldset class="f-inj"><legend>Syringe maths (optional)</legend>
      <p class="muted small" style="margin:0">Not sure? Use the calculator in Settings, then save it to this compound.</p>
      <label>Syringe<select name="syringe"><option value="">Not tracked</option>${S.supplies.map((x) => `<option value="${x.id}" ${c.syringe === x.id ? 'selected' : ''}>${esc(syrLabel(x))}</option>`).join('')}</select></label>
      ${S.supplies.length ? '' : '<p class="muted small" style="margin:0">Add your syringes under Stack → Supplies to track them per dose.</p>'}
      <label>Concentration<select name="mixtype" data-act="formsync">${opt([['none', 'Skip'], ['premix', 'Pre-mixed (e.g. oil)'], ['recon', 'Reconstituted vial']], c.mix?.type || 'none')}</select></label>
      <label class="f-premix">Strength per ml<input name="conc" inputmode="decimal" value="${esc(c.mix?.conc || '')}" placeholder="e.g. 200 (in your dose unit per ml)"></label>
      <div class="grid2 f-recon"><label>Amount in vial<input name="vial" inputmode="decimal" value="${esc(c.mix?.vial || '')}" placeholder="e.g. 10"></label>
        <label>Water added (ml)<input name="water" inputmode="decimal" value="${esc(c.mix?.water || '')}" placeholder="e.g. 2"></label></div>
    </fieldset>
    <div class="grid2"><label>On hand (dose unit)<input name="supply" inputmode="decimal" value="${esc(c.supply ?? '')}" placeholder="e.g. 40"></label>
      <label>Per vial / bottle<input name="perVial" inputmode="decimal" value="${esc(c.perVial ?? '')}" placeholder="e.g. 10"></label></div>
    <label>Notes<input name="notes" value="${esc(c.notes || '')}" placeholder="Optional"></label>
    <button class="btn">${isNew ? 'Add to protocol' : 'Save changes'}</button>
    ${isNew ? '' : `<button type="button" class="btn ghost danger" data-act="delcompound" data-id="${c.id}">Delete compound and its log</button>`}
  </form>`;
}

function compoundSheet(id) {
  const c = compById(id); if (!c) return '';
  const nd = nextDue(c), ad = adherence(c), rw = runwayDays(c);
  const strip = Array.from({ length: 28 }, (_, i) => {
    const d = dateAdd(today(), i - 27), due = isDue(c, d), taken = dosesOn(c.id, d).length > 0;
    const cls = taken ? 'hit' : due && d < today() ? 'miss' : due ? 'due' : '';
    return `<i class="${cls}" title="${esc(fmtDate(d))}"></i>`;
  }).join('');
  const recent = S.doses.filter((x) => x.cid === c.id).sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1)).slice(0, 10);
  const sites = SITES[c.route];
  const sug = suggestSite(c);
  return `<div class="kicker">${esc((KINDS.find(([k]) => k === c.kind) || ['', ''])[1])} · ${esc(c.route)}</div>
    <h2>${esc(c.name)}</h2>
    <p class="muted">${esc([doseText(c), schedText(c), c.time].filter(Boolean).join(' · '))}</p>
    ${drawText(c) ? `<p class="hint small">${esc(drawText(c))}</p>` : ''}
    <div class="stats">
      <div><span>Next</span><b>${c.paused ? 'Paused' : nd ? (nd === today() ? 'Today' : esc(fmtShort(nd))) : '—'}</b></div>
      <div><span>28-day</span><b>${ad != null ? ad + '%' : '—'}</b></div>
      <div><span>Supply</span><b>${c.supply !== '' && c.supply != null ? `${fmtNum(+c.supply)} ${esc(c.unit)}` : '—'}${rw != null ? `<em>${rw} days</em>` : ''}</b></div>
    </div>
    <h4>Last 4 weeks</h4><div class="strip">${strip}</div>
    <p class="muted small legend-row"><i class="hit"></i> taken <i class="miss"></i> missed <i class="due"></i> due</p>
    <h4>Log a dose</h4>
    <form class="cform" data-act="logdose" data-id="${c.id}">
      <div class="grid2"><label>Amount (${esc(c.unit || 'dose')})<input name="amount" inputmode="decimal" value="${esc(c.dose)}"></label>
        ${sites ? `<label>Site<select name="site">${sites.map((s) => `<option ${s === sug ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label>` : '<span></span>'}</div>
      <div class="grid2"><label>Date<input name="date" type="date" value="${today()}"></label><label>Time<input name="time" type="time" value="${nowTime()}"></label></div>
      <label>Note<input name="note" placeholder="Optional: how you felt, side effects…"></label>
      <button class="btn">Log dose</button>
    </form>
    ${recent.length ? `<h4>History</h4><div class="card list inset">${recent.map((x) => `<div class="exrow"><span>${esc(fmtDate(x.date))} ${esc(x.time)}<em> · ${esc([doseText(c, x.amount), x.site, x.note].filter(Boolean).join(' · '))}</em></span><button class="x" data-act="deldose" data-id="${x.id}" data-c="${c.id}" aria-label="Delete dose">×</button></div>`).join('')}</div>` : ''}
    <div class="stack-btns">
      ${+c.perVial > 0 ? `<button class="btn ghost" data-act="addvial" data-id="${c.id}">+ Add vial / bottle (+${fmtNum(+c.perVial)} ${esc(c.unit)})</button>` : ''}
      ${c.sched.type !== 'prn' ? `<button class="btn ghost" data-act="ics" data-id="${c.id}">Add reminders to my calendar</button>` : ''}
      ${isInj(c) ? `<button class="btn ghost" data-act="opencalc" data-id="${c.id}">Dose calculator</button>` : ''}
      <button class="btn ghost" data-act="editcompound" data-id="${c.id}">Edit</button>
      <button class="btn ghost" data-act="pausecompound" data-id="${c.id}">${c.paused ? 'Resume' : 'Pause'}</button>
    </div>
    ${c.notes ? `<p class="muted small">${esc(c.notes)}</p>` : ''}`;
}

function supplyForm(x) {
  const isNew = !x;
  x ||= { type: 'insulin', size: '0.5', gauge: '31', length: '5/16"', count: '', low: '10', box: '100' };
  return `<h2>${isNew ? 'Add syringes' : 'Syringes'}</h2>
  ${isNew ? '' : `<p class="muted">${esc(syrLabel(x))} · ${fmtNum(+x.count)} on hand</p>
    <div class="stack-btns"><button class="btn" data-act="addbox" data-id="${x.id}">+ Add a box (+${fmtNum(+x.box || 100)})</button></div><h4>Edit</h4>`}
  <form class="cform" data-act="savesupply" data-id="${x.id || ''}" data-type="${x.type}">
    <label>Type<select name="type" data-act="supsync">
      <option value="insulin" ${x.type === 'insulin' ? 'selected' : ''}>Insulin syringe, U-100 (SubQ)</option>
      <option value="ml" ${x.type === 'ml' ? 'selected' : ''}>Syringe with ml markings (IM)</option></select></label>
    <label class="f-ins">Size<select name="size_ins">${SYR_SIZES.insulin.map((v) => `<option value="${v}" ${x.type === 'insulin' && String(x.size) === v ? 'selected' : ''}>${v} ml (${+v * 100} units)</option>`).join('')}</select></label>
    <label class="f-ml">Size<select name="size_ml">${SYR_SIZES.ml.map((v) => `<option value="${v}" ${x.type === 'ml' && String(x.size) === v ? 'selected' : ''}>${v} ml</option>`).join('')}</select></label>
    <div class="grid2"><label>Gauge<input name="gauge" inputmode="numeric" value="${esc(x.gauge || '')}" placeholder="e.g. 31"></label>
      <label>Needle length<input name="length" list="lengths" value="${esc(x.length || '')}" placeholder='e.g. 5/16"'></label></div>
    <datalist id="lengths"><option value='5/16"'><option value='1/2"'><option value='5/8"'><option value='1"'><option value='1.5"'></datalist>
    <div class="grid2"><label>On hand<input name="count" inputmode="numeric" value="${esc(x.count)}" placeholder="e.g. 100" required></label>
      <label>Warn me below<input name="low" inputmode="numeric" value="${esc(x.low ?? '')}" placeholder="e.g. 10"></label></div>
    <label>Box size (for quick restock)<input name="box" inputmode="numeric" value="${esc(x.box ?? '')}" placeholder="e.g. 100"></label>
    <button class="btn${isNew ? '' : ' ghost'}">${isNew ? 'Add syringes' : 'Save changes'}</button>
    ${isNew ? '' : `<button type="button" class="btn ghost danger" data-act="delsupply" data-id="${x.id}">Delete</button>`}
  </form>`;
}

function saveCompound(form) {
  const f = new FormData(form);
  const g = (k) => String(f.get(k) ?? '').trim();
  const sk = g('sched');
  const sched = sk === 'prn' ? { type: 'prn' } : sk === 'wd' ? { type: 'weekdays', days: f.getAll('days').map(Number) } : { type: 'interval', every: Math.max(1, parseInt(sk === 'n' ? g('every') : sk, 10) || 1) };
  if (sched.type === 'weekdays' && !sched.days.length) { toast('Pick at least one day.'); return; }
  const data = {
    name: g('name'), kind: g('kind'), dose: g('dose'), unit: g('unit'), route: g('route'), sched, time: g('time') || '08:00',
    start: g('start') || today(), end: g('end'),
    mix: { type: g('mixtype') || 'none', conc: g('conc'), vial: g('vial'), water: g('water') },
    syringe: g('syringe'),
    supply: g('supply') === '' ? '' : +g('supply'), perVial: g('perVial') === '' ? '' : +g('perVial'), notes: g('notes'),
  };
  if (!data.name) return;
  const id = form.dataset.id;
  if (id) Object.assign(compById(id), data); else S.compounds.push({ id: uid(), ...data });
  save(); closeSheet(); render(); toast(id ? 'Saved.' : `${data.name} added to your protocol.`);
}

function icsFor(c) {
  const [hh, mm] = (c.time || '08:00').split(':');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  let rule = c.sched.type === 'weekdays'
    ? 'FREQ=WEEKLY;BYDAY=' + c.sched.days.map((d) => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][d]).join(',')
    : 'FREQ=DAILY;INTERVAL=' + c.sched.every;
  if (c.end) rule += ';UNTIL=' + c.end.replace(/-/g, '') + 'T235959';
  const start = c.sched.type === 'weekdays' ? nextDue({ ...c, paused: false }, c.start) || c.start : c.start;
  const title = `${c.name}${doseText(c) ? ' ' + doseText(c) : ''}`.replace(/[,;\\]/g, ' ');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IRON77//Protocol//EN', 'BEGIN:VEVENT',
    `UID:${c.id}@iron77`, `DTSTAMP:${stamp}`, `DTSTART:${start.replace(/-/g, '')}T${hh}${mm}00`, 'DURATION:PT10M', `RRULE:${rule}`,
    `SUMMARY:${title}`, 'DESCRIPTION:Logged in IRON77', 'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', `DESCRIPTION:${title}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

function summaryText() {
  const from = dateAdd(today(), -89);
  const lines = [`IRON77 protocol summary`, `Generated ${fmtDate(today())} · covers ${fmtDate(from)} to ${fmtDate(today())}`, ''];
  for (const c of S.compounds) {
    const ds = S.doses.filter((x) => x.cid === c.id && x.date >= from);
    lines.push(`${c.name}${c.paused ? ' (paused)' : ''}`);
    lines.push(`  ${[doseText(c), c.route, schedText(c)].filter(Boolean).join(', ')} · since ${fmtDate(c.start)}${c.end ? ' until ' + fmtDate(c.end) : ''}`);
    const ad = adherence(c, 90);
    lines.push(`  Doses logged: ${ds.length}${ad != null ? ` · adherence ${ad}%` : ''}${ds.length ? ` · last ${fmtDate(ds.map((x) => x.date).sort().pop())}` : ''}`);
    const notes = ds.filter((x) => x.note).slice(-5);
    if (notes.length) lines.push(...notes.map((x) => `  Note ${fmtDate(x.date)}: ${x.note}`));
    lines.push('');
  }
  const ws = [...S.weights].filter((x) => x.date >= from).sort((a, b) => (a.date < b.date ? -1 : 1));
  if (ws.length >= 2) {
    const d = +ws[ws.length - 1].w - +ws[0].w;
    lines.push(`Bodyweight: ${ws[0].w} → ${ws[ws.length - 1].w} ${S.settings.unit} (${d > 0 ? '+' : ''}${fmtNum(d)}) from ${fmtDate(ws[0].date)} to ${fmtDate(ws[ws.length - 1].date)}`);
  }
  return lines.join('\n');
}

const syncForm = (form) => {
  form.dataset.sched = form.elements.sched.value;
  form.dataset.mix = form.elements.mixtype.value;
  form.dataset.route = form.elements.route.value;
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]'); if (!el) return;
  const d = el.dataset; const c = d.id && compById(d.id);
  switch (d.act) {
    case 'stacktab': stackTab = d.k; render(); break;
    case 'newcompound': openSheet(compoundPicker()); setTimeout(() => $('#sheet .search')?.focus(), 250); break;
    case 'pickcompound': {
      const t = COMPOUNDS.find((x) => x[0] === d.n);
      openSheet(compoundForm({ name: t[0], kind: t[1], route: t[2], unit: t[3], mix: { type: t[4] || 'none' } }, t[6]));
      break;
    }
    case 'customcompound': {
      const q = ($('#sheet .search')?.value || '').trim();
      openSheet(compoundForm(q ? { name: q } : null));
      break;
    }
    case 'compound': openSheet(compoundSheet(d.id)); break;
    case 'editcompound': openSheet(compoundForm(c)); break;
    case 'quicklog': {
      const dose = logDose(c); render();
      toast(`Logged ${c.name}${dose.site ? ' · ' + dose.site : ''}`); break;
    }
    case 'untake': { const t = dosesOn(c.id, today()).pop(); if (t) { removeDose(t.id); render(); toast(`Undid ${c.name}.`); } break; }
    case 'logmissed': logDose(c, { date: d.d, time: c.time || '08:00' }); render(); toast(`Logged ${c.name} for ${fmtDate(d.d)}.`); break;
    case 'deldose': if (confirm('Delete this dose from your log?')) { removeDose(d.id); openSheet(compoundSheet(d.c)); render(); } break;
    case 'addvial': c.supply = (+c.supply || 0) + +c.perVial; save(); openSheet(compoundSheet(c.id)); render(); toast('Supply updated.'); break;
    case 'pausecompound': c.paused = !c.paused; save(); openSheet(compoundSheet(c.id)); render(); break;
    case 'delcompound':
      if (confirm(`Delete ${c.name} and all its logged doses?`)) { S.compounds = S.compounds.filter((x) => x.id !== c.id); S.doses = S.doses.filter((x) => x.cid !== c.id); save(); closeSheet(); render(); }
      break;
    case 'ics': {
      const blob = new Blob([icsFor(c)], { type: 'text/calendar' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${c.name.replace(/[^\w]+/g, '-')}-reminders.ics`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Open the file to add repeating reminders to your calendar.'); break;
    }
    case 'summary': {
      const txt = summaryText();
      openSheet(`<h2>Protocol summary</h2><p class="muted small">Last 90 days. Share it or copy it into a message to your doctor.</p>
        <textarea class="summary" readonly>${esc(txt)}</textarea>
        <div class="stack-btns">${navigator.share ? '<button class="btn" data-act="sharesum">Share</button>' : ''}<button class="btn ghost" data-act="copysum">Copy</button></div>`);
      break;
    }
    case 'sharesum': navigator.share({ title: 'IRON77 protocol summary', text: summaryText() }).catch(() => {}); break;
    case 'copysum': navigator.clipboard?.writeText(summaryText()).then(() => toast('Copied.'), () => toast('Select the text and copy it.')); break;
  }
});
document.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.dataset.act === 'formsync') syncForm(el.form);
  if (el.dataset.act === 'togglestack') {
    const sup = SUPPLEMENTS.find((x) => x.id === el.dataset.id);
    if (el.checked) S.compounds.push({ id: uid(), guide: sup.id, name: sup.name, kind: 'supplement', dose: '', unit: '', route: 'Oral', sched: { type: 'interval', every: 1 }, time: '08:00', start: today(), end: '', mix: { type: 'none' }, supply: '', perVial: '', notes: '' });
    else { const ids = S.compounds.filter((c) => c.guide === sup.id).map((c) => c.id); S.compounds = S.compounds.filter((c) => !ids.includes(c.id)); S.doses = S.doses.filter((x) => !ids.includes(x.cid)); }
    save(); toast(el.checked ? `${sup.name} added to My protocol.` : `${sup.name} removed.`);
  }
});
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]'); if (!el) return;
  const d = el.dataset, x = d.id && syrById(d.id);
  if (d.act === 'newsupply') openSheet(supplyForm());
  else if (d.act === 'supply') openSheet(supplyForm(x));
  else if (d.act === 'addbox') { x.count = +x.count + (+x.box || 100); save(); openSheet(supplyForm(x)); render(); toast(`${fmtNum(+x.count)} syringes on hand.`); }
  else if (d.act === 'delsupply' && confirm('Delete these syringes from your supplies?')) {
    S.supplies = S.supplies.filter((y) => y.id !== x.id);
    S.compounds.forEach((c) => { if (c.syringe === x.id) c.syringe = ''; });
    save(); closeSheet(); render();
  }
});
document.addEventListener('change', (ev) => { if (ev.target.dataset.act === 'supsync') ev.target.form.dataset.type = ev.target.value; });

document.addEventListener('submit', (ev) => {
  const form = ev.target; const act = form.dataset.act;
  if (act === 'savesupply') {
    ev.preventDefault();
    const f = new FormData(form), g = (k) => String(f.get(k) ?? '').trim(), type = g('type');
    const data = { type, size: type === 'insulin' ? g('size_ins') : g('size_ml'), gauge: g('gauge').replace(/g$/i, ''), length: g('length'), count: +g('count') || 0, low: g('low') === '' ? '' : +g('low'), box: +g('box') || '' };
    const id = form.dataset.id;
    if (id) Object.assign(syrById(id), data); else S.supplies.push({ id: uid(), ...data });
    save(); closeSheet(); render();
    toast(id ? 'Saved.' : 'Syringes added. Link them in each compound\u2019s Syringe field.');
    return;
  }
  if (act === 'savecompound') { ev.preventDefault(); saveCompound(form); }
  else if (act === 'logdose') {
    ev.preventDefault();
    const c = compById(form.dataset.id); const f = new FormData(form);
    logDose(c, { amount: String(f.get('amount') || '').trim(), site: String(f.get('site') || ''), date: f.get('date') || today(), time: f.get('time') || nowTime(), note: String(f.get('note') || '').trim() });
    openSheet(compoundSheet(c.id)); render(); toast(`Logged ${c.name}.`);
  } else if (act === 'logweight') {
    ev.preventDefault();
    const w = parseFloat(new FormData(form).get('w'));
    if (!(w > 0)) return;
    S.weights = S.weights.filter((x) => x.date !== today()); S.weights.push({ date: today(), w });
    S.settings.bodyweight = w; save(); render(); toast('Weigh-in logged.');
  }
});

/* ---------- reconstitution & dosage calculator ---------- */
const CALC_DEFAULT = { mode: 'recon', vial: '10', vialUnit: 'mg', water: '2', conc: '200', concUnit: 'mg', dose: '2', doseUnit: 'mg', syringe: '100', units: '' };
const toBase = (v, u) => (u === 'mg' ? +v * 1000 : +v); // mg → mcg; mcg and IU stay as-is
const fromBase = (v, u) => (u === 'mg' ? v / 1000 : v);
const unitClash = (a, b) => (a === 'IU') !== (b === 'IU');

function calcResult(k) {
  const amtUnit = k.mode === 'recon' ? k.vialUnit : k.concUnit;
  if (unitClash(amtUnit, k.doseUnit)) return { err: 'IU can’t be converted to mg or mcg. Use IU for both the vial and the dose.' };
  let concBase, total = null;
  if (k.mode === 'recon') {
    if (!(+k.vial > 0) || !(+k.water > 0)) return { err: 'Enter the amount in the vial and the water you add.' };
    total = toBase(k.vial, k.vialUnit); concBase = total / +k.water;
  } else {
    if (!(+k.conc > 0)) return { err: 'Enter the strength printed on the vial.' };
    concBase = toBase(k.conc, k.concUnit);
  }
  const out = { concBase, total, cap: +k.syringe || 100 };
  if (+k.dose > 0) {
    const doseBase = toBase(k.dose, k.doseUnit);
    out.ml = doseBase / concBase; out.units = out.ml * 100;
    if (total) out.perVial = total / doseBase;
    if (total) out.roundWater = [10, 20, 25, 50].map((u) => [u, (total * u) / (doseBase * 100)]).filter(([, w]) => w >= 0.5 && w <= 5);
  }
  if (+k.units > 0) out.rev = fromBase((+k.units / 100) * concBase, k.doseUnit);
  return out;
}

const showAmt = (base, u) => {
  if (u === 'IU') return `${fmtNum(base)} IU`;
  return base >= 1000 ? `${fmtNum(base / 1000)} mg` : `${fmtNum(base)} mcg`;
};

function syringeSVG(units, cap) {
  const W = 320, x0 = 18, x1 = 292, over = units > cap;
  const fill = Math.min(units, cap) / cap * (x1 - x0);
  const step = cap <= 30 ? 5 : cap <= 50 ? 5 : 10;
  const ticks = [];
  for (let u = 0; u <= cap; u += step) {
    const x = x0 + (u / cap) * (x1 - x0), major = u % (step * 2) === 0;
    ticks.push(`<line x1="${x}" x2="${x}" y1="20" y2="${major ? 32 : 27}" stroke="var(--well)" stroke-width="1.5"/>`);
    if (major) ticks.push(`<text x="${x}" y="58" text-anchor="middle" font-size="9" fill="var(--label)" font-family="IBM Plex Mono">${u}</text>`);
  }
  return `<svg class="syringe" viewBox="0 0 ${W} 64" role="img" aria-label="Syringe filled to ${fmtNum(units)} units">
    <rect x="${x0}" y="18" width="${x1 - x0}" height="26" rx="4" fill="var(--ink)" opacity=".92"/>
    <rect x="${x0}" y="18" width="${fill}" height="26" rx="4" fill="${over ? 'var(--red)' : 'var(--accent)'}" opacity=".85"/>
    ${ticks.join('')}
    <rect x="2" y="27" width="${x0 - 2}" height="8" fill="var(--label)"/>
    <rect x="${x0 + fill - 3}" y="14" width="6" height="34" rx="2" fill="var(--well)"/>
    <rect x="${x0 + fill}" y="28" width="${W - x0 - fill - 6}" height="6" fill="var(--welltext)" opacity=".6"/>
    <rect x="${W - 8}" y="16" width="6" height="30" rx="2" fill="var(--welltext)"/>
  </svg>`;
}

function calcOutput() {
  const k = S.calc, r = calcResult(k);
  if (r.err) return `<p class="warn small">${esc(r.err)}</p>`;
  const cu = k.mode === 'recon' ? k.vialUnit : k.concUnit;
  const parts = [`<div class="stats">
      <div><span>Strength</span><b>${showAmt(r.concBase, cu)}/ml</b></div>
      <div><span>Per unit</span><b>${showAmt(r.concBase / 100, cu)}</b></div>
      <div><span>Per 10 units</span><b>${showAmt(r.concBase / 10, cu)}</b></div>
    </div>`];
  if (r.units != null) {
    const draws = Math.ceil(r.units / r.cap);
    parts.push(`<div class="drawbox">
      <span class="kicker">Draw</span>
      <div class="drawnum">${fmtNum(r.units)} <small>units</small></div>
      <p class="muted">${fmtNum(r.ml)} ml on a U-100 insulin syringe${r.perVial ? ` · about ${Math.floor(r.perVial)} dose${Math.floor(r.perVial) === 1 ? '' : 's'} per vial` : ''}</p>
      ${syringeSVG(r.units, r.cap)}
      ${r.units > r.cap ? `<p class="warn small">That's more than a ${r.cap}-unit syringe holds: split it into ${draws} draws, or use a bigger syringe.</p>` : ''}
      ${r.units < 3 ? `<p class="warn small">Very small volume, which is hard to measure accurately. Adding more water makes each unit hold less.</p>` : ''}
    </div>`);
    if (r.roundWater && r.roundWater.length) parts.push(`<p class="muted small">For a round number on the syringe, add: ${r.roundWater.map(([u, w]) => `<b>${fmtNum(w)} ml</b> → ${u} units`).join(' · ')}</p>`);
  }
  if (r.rev != null) parts.push(`<p class="hint">${fmtNum(+k.units)} units = <b>${fmtNum(r.rev)} ${esc(k.doseUnit)}</b></p>`);
  return parts.join('');
}

V.calc = (cid) => {
  S.calc = { ...CALC_DEFAULT, ...(S.calc || {}) };
  const c = cid && compById(cid);
  if (c && !S.calcFrom) {
    // prefill from a compound in the protocol
    const u = ['mg', 'mcg', 'IU'].includes(c.unit) ? c.unit : 'mg';
    Object.assign(S.calc, { dose: c.dose || S.calc.dose, doseUnit: u, vialUnit: u, concUnit: u });
    if (c.mix?.type === 'recon') Object.assign(S.calc, { mode: 'recon', vial: c.mix.vial || S.calc.vial, water: c.mix.water || S.calc.water });
    if (c.mix?.type === 'premix') Object.assign(S.calc, { mode: 'premix', conc: c.mix.conc || S.calc.conc });
    S.calcFrom = cid;
  }
  const k = S.calc;
  const uSel = (name, v) => `<select name="${name}" data-act="calc">${['mg', 'mcg', 'IU'].map((u) => `<option ${u === v ? 'selected' : ''}>${u}</option>`).join('')}</select>`;
  const injectables = S.compounds.filter((x) => isInj(x) && ['mg', 'mcg', 'IU'].includes(x.unit));
  return `
  <header class="top"><button class="icon" data-act="go" data-v="${cid ? 'stack' : 'settings'}" aria-label="Back">${IC.back}</button><h1 class="sm">Dose calculator</h1></header>
  <div class="seg">${[['recon', 'Reconstitute powder'], ['premix', 'Pre-mixed vial']].map(([m, n]) => `<button class="${k.mode === m ? 'on' : ''}" data-act="calcmode" data-m="${m}">${n}</button>`).join('')}</div>
  <section class="card calc" style="margin-top:12px">
    ${k.mode === 'recon' ? `
      <label>Amount in vial</label><div class="unitrow"><input name="vial" inputmode="decimal" value="${esc(k.vial)}" data-act="calc">${uSel('vialUnit', k.vialUnit)}</div>
      <label>Bacteriostatic water added (ml)</label><input name="water" inputmode="decimal" value="${esc(k.water)}" data-act="calc">`
    : `<label>Strength printed on vial (per ml)</label><div class="unitrow"><input name="conc" inputmode="decimal" value="${esc(k.conc)}" data-act="calc">${uSel('concUnit', k.concUnit)}</div>`}
    <label>Dose you want</label><div class="unitrow"><input name="dose" inputmode="decimal" value="${esc(k.dose)}" data-act="calc">${uSel('doseUnit', k.doseUnit)}</div>
    <label>Syringe size</label>
    <select name="syringe" data-act="calc">${[['30', '0.3 ml (30 units)'], ['50', '0.5 ml (50 units)'], ['100', '1 ml (100 units)']].map(([v, n]) => `<option value="${v}" ${String(k.syringe) === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
  </section>
  <section class="card" id="calcout">${calcOutput()}</section>
  <section class="card calc">
    <h3>Reverse: what's in my syringe?</h3>
    <label>Units drawn</label><input name="units" inputmode="decimal" value="${esc(k.units)}" placeholder="e.g. 20" data-act="calc">
    <p class="muted small">Uses the vial details above.</p>
  </section>
  ${injectables.length ? `<section class="card calc"><h3>Save to a compound</h3>
    <p class="muted small">Stores this vial's strength on the compound, so Today and the log show the draw for every dose.</p>
    <div class="unitrow"><select id="calcapply">${injectables.map((x) => `<option value="${x.id}" ${x.id === (cid || S.calcFrom) ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
    <button class="btn ghost" data-act="calcapply">Save</button></div></section>` : ''}
  <p class="muted small pad">Assumes a standard U-100 insulin syringe (100 units = 1 ml). The calculator does the maths for the numbers you enter; it doesn't recommend doses. Double-check your vial's label.</p>`;
};

document.addEventListener('input', (ev) => {
  const el = ev.target; if (el.dataset.act !== 'calc') return;
  S.calc[el.name] = el.value.trim(); save();
  const out = document.getElementById('calcout'); if (out) out.innerHTML = calcOutput();
});
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]'); if (!el) return;
  if (el.dataset.act === 'calcmode') { S.calc.mode = el.dataset.m; save(); render(); }
  else if (el.dataset.act === 'opencalc') { S.calcFrom = null; closeSheet(); go('calc', el.dataset.id || null); }
  else if (el.dataset.act === 'calcapply') {
    const c = compById(document.getElementById('calcapply').value); const k = S.calc;
    const r = calcResult(k); if (r.err) { toast(r.err); return; }
    if (unitClash(c.unit, k.doseUnit)) { toast(`${c.name} is dosed in ${c.unit}; use matching units.`); return; }
    if (k.mode === 'recon') c.mix = { type: 'recon', vial: String(fromBase(toBase(k.vial, k.vialUnit), c.unit)), water: k.water };
    else c.mix = { type: 'premix', conc: String(fromBase(toBase(k.conc, k.concUnit), c.unit)) };
    save(); toast(`Saved to ${c.name}: ${drawText(c) || 'strength stored'}.`);
  }
});

/* ---------- render & routing ---------- */
function render() {
  $('#view').innerHTML = (V[view] || V.today)(viewArg);
  document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('on', b.dataset.v === view || (['program', 'library', 'equipment'].includes(view) && b.dataset.v === 'train') || (view === 'session' && b.dataset.v === 'train')));
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
    case 'go': if (d.v === 'equipment') { S.equipSet = true; save(); } closeSheet(); go(d.v, d.arg || null); break;
    case 'demo': openSheet(demoSheet(d.n, d.e != null ? +d.e : null)); break;
    case 'closesheet': closeSheet(); break;
    case 'addex': openSheet(addSheet()); break;
    case 'addpick': addExercise(d.n); break;
    case 'swapex': swapExercise(+d.e, d.to); break;
    case 'removeex': if (confirm('Remove this exercise from today\u2019s workout?')) { S.current.exercises.splice(+d.e, 1); save(); closeSheet(); render(); } break;
    case 'unswap': delete S.swaps[d.n]; save(); render(); toast('Swap removed.'); break;
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
  if (d.act === 'equip') {
    S.equipment = el.checked ? [...new Set([...S.equipment, d.k])] : S.equipment.filter((x) => x !== d.k);
    S.equipSet = true; save();
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

document.addEventListener('input', (ev) => {
  if (ev.target.dataset.act !== 'exsearch') return;
  const q = ev.target.value.trim().toLowerCase();
  const root = ev.target.nextElementSibling;
  const words = q.split(/[\s\-()/]+/).filter(Boolean);
  root.querySelectorAll('.exrow').forEach((r) => {
    const toks = r.dataset.search.split(/[\s\-()/]+/);
    r.hidden = words.length > 0 && !words.every((w) => toks.some((t) => t.startsWith(w)));
  });
  root.querySelectorAll('.list').forEach((l) => {
    const any = [...l.querySelectorAll('.exrow')].some((r) => !r.hidden);
    l.hidden = !any; l.previousElementSibling.hidden = !any;
  });
});
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeSheet(); });
document.addEventListener('input', (ev) => {
  const btn = document.getElementById('customcomp');
  if (!btn || ev.target.dataset.act !== 'exsearch') return;
  const q = ev.target.value.trim();
  const any = [...document.querySelectorAll('#sheet .exrow')].some((r) => !r.hidden);
  btn.textContent = q && !any ? `Add “${q}” as a custom compound` : 'Add a custom compound';
  btn.className = q && !any ? 'btn' : 'btn ghost';
});

document.addEventListener('submit', (ev) => {
  const form = ev.target;
  if (form.dataset.act === 'addcustomex') {
    ev.preventDefault();
    const name = new FormData(form).get('name').trim();
    if (name) addExercise(name);
    return;
  }
  if (form.dataset.act !== 'addcustom') return;
  ev.preventDefault();
  const fd = new FormData(form);
  const item = { name: fd.get('name').trim(), p: +fd.get('p') || 0, c: +fd.get('c') || 0, f: +fd.get('f') || 0 };
  if (!item.name) return;
  (S.food[today()] ||= []).push(item); save(); render(); toast(`Added ${item.name}`);
});

if (S.current) view = 'session';
render();
/* ---------- updates ---------- */
// The installed app checks for a new version whenever it comes back to the foreground
// (iOS resumes home-screen apps instead of restarting them), and reloads once it lands.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    const check = () => reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    setInterval(check, 15 * 60 * 1000);
  }).catch(() => {});
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    if (S.current) { toast('IRON77 updated. The new version loads next time you open the app.'); return; }
    location.reload();
  });
}
async function forceUpdate() {
  toast('Checking for updates…');
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations()) || [];
    await Promise.all(regs.map((r) => r.unregister()));
    const keys = (await caches?.keys()) || [];
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch {}
  location.reload();
}
document.addEventListener('click', (ev) => { if (ev.target.closest('[data-act="forceupdate"]')) forceUpdate(); });
})();
