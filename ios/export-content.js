// Export IRON77 content (js/data.js) to plain JSON for the native iOS app.
const fs = require('fs'), vm = require('vm');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(require('path').join(__dirname, '..', 'js/data.js'), 'utf8') + `
this.out = { PROGRAMS, EQUIPMENT, EX_ALIASES, EXERCISES, COMPOUNDS, DEMO_BASE, EX_DEMO, DAY_NOTES, TRAIN_GOALS, PROGRAM_FIT,
  CYCLE_PER_WEEK, CYCLE_WEEKS, PHASE_NAMES, PHASES, CORE_LIFTS: [...CORE_LIFTS], ROTATE, WARMUP_MOVES, EXTRA_TARGETS, DAY_B };`, ctx);
const o = ctx.out;
const json = {
  version: 1,
  note: 'Generated from IRON77 js/data.js. Do not edit by hand; regenerate with ios/export-content.js.',
  demoBaseURL: o.DEMO_BASE,
  programs: o.PROGRAMS,
  programDayB: o.DAY_B,
  dayNotes: o.DAY_NOTES,
  equipment: o.EQUIPMENT.map(([id, name]) => ({ id, name })),
  exerciseAliases: o.EX_ALIASES,
  exercises: Object.entries(o.EXERCISES).map(([name, [group, equipment, alternatives, cues]]) => ({
    name, group, equipment, alternatives, cues, target: o.EXTRA_TARGETS[name] || null, demoId: o.EX_DEMO[name] || null })),
  compounds: o.COMPOUNDS.map(([name, kind, route, unit, mix, keywords, hint]) => ({ name, kind, route, unit, mix, keywords, hint })),
  trainGoals: o.TRAIN_GOALS, programFit: o.PROGRAM_FIT,
  cycle: { weeks: o.CYCLE_WEEKS, perWeek: o.CYCLE_PER_WEEK, phaseNames: o.PHASE_NAMES, phases: o.PHASES, coreLifts: o.CORE_LIFTS, rotate: o.ROTATE },
  warmupMoves: o.WARMUP_MOVES,
};
fs.writeFileSync(require('path').join(__dirname, 'iron77-content.json'), JSON.stringify(json, null, 2) + '\n');
console.log('programs', json.programs.length, 'exercises', json.exercises.length, 'compounds', json.compounds.length);
