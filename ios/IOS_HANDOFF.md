# IRON77 → native iOS: handoff spec

This file is meant for a separate Claude project in which the owner is learning iOS development by rebuilding IRON77 as a native SwiftUI app. Add this file and `iron77-content.json` (next to it) to that project's files.

- **Web app (the working reference):** https://mosurabeats.github.io/IRON77/
- **Source:** https://github.com/mosurabeats/IRON77, branch `claude/iron77-initial-app`. Logic is in `js/app.js` and content in `js/data.js`.
- **Owner:** one person, personal use, possibly one friend. It will never go to the public App Store. That keeps scope small: no accounts, no backend, no monetisation.

---

## 1. What IRON77 is

IRON77 is a golden-era bodybuilding app built around Mentzer's Heavy Duty, Arnold, Reg Park, Gironda and the Venice Beach era. It's named for 1977, the year of *Pumping Iron*. It has three tabs.

| Tab | What it does |
|---|---|
| **Today** | Weekly goal ring and streak, this week's workouts (in a cycle) or the next workout plus "Coming up", recovery status, and today's protocol doses. |
| **Train** | Programs, 6-week cycles, the exercise library with animated demos, the workout logger (guided or list), progress charts, "My gym" equipment, and the logbook with recap/edit/delete. |
| **Stack** | Protocol tracker for supplements, peptides and hormones: schedules, dose logging, injection-site rotation, syringe maths, adherence and bodyweight. Settings has a reconstitution and dose calculator. |

Everything is stored on the device. Settings → Export writes a JSON backup, and the iOS app should be able to import it (section 5).

## 2. Content: `iron77-content.json`

This is generated from `js/data.js` by `node ios/export-content.js`. Bundle it in the app and decode it with `Codable`.

| Key | Contents |
|---|---|
| `programs` (7) | `id, name, legend, style, level, freq, restDays, summary, principles[], days[{name, exercises[{name, sets, reps, ss?, note?}]}]`. `style` is one of `HIT`, `Volume`, `Classic`, `Strength`, `Density`. `ss: true` means "superset with the next exercise". `reps` is a string such as `"6-10"`, `"8"` or `"max"`. |
| `programDayB` | Hand-written second versions of days, keyed `"programId|Day name"` (Arnold split). |
| `dayNotes` | `{brief, logistics, philosophy}` per day, keyed `"programId|Day name"`, with `A`/`B` suffixes where they differ. |
| `exercises` (89) | `name, group, equipment[] (ids), alternatives[] (best first), cues[], target, demoId`. |
| `equipment` | `{id, name}`. An exercise is doable when all its equipment ids are in the user's gym list. |
| `exerciseAliases` | Old name → current name. Apply when importing history. |
| `compounds` (90) | Searchable presets: `name, kind (peptide/hormone/supplement/medication), route (SubQ/IM/Oral/…), unit, mix (recon/premix/none), keywords, hint`. |
| `cycle` | `weeks` (6), `perWeek` per program, `phaseNames`, `phases[style] = {sets[6], text[6]}`, `coreLifts`, `rotate` (curated variations). |
| `trainGoals`, `programFit` | Goal → program suggestions when starting a cycle. |
| `warmupMoves` | Timed general warm-up by muscle group: `[label, seconds]`. |

**Demos:** each GIF is at `demoBaseURL + demoId + ".gif"` (ExerciseDB). The web app shows them on a dark background by inverting the colours (`filter: invert(1) hue-rotate(180deg)` with screen blending). In SwiftUI, cache them to disk and play them with an animated-image view; the file includes no player.

## 3. Rules the app runs on (port these exactly)

**Recovery (HIT programs).** Find the last session of the active program. You're ready when the days since it reach `restDays`. If that session beat the previous log on fewer than half its lifts, add 1 rest day (Mentzer's rule).

**"Beat the logbook."** For each lift, the best set is the heaviest weight, with more reps breaking a tie. A lift counts as up when its best set beats the previous session's best set for that lift.

**6-week cycles.** State: `{n, programId, goal, start, sessions, slots{week:[slotIdx]}, rot, done, end}`.
- `per = perWeek[programId]` and `total = per × 6`. Weeks advance by sessions, not by the calendar: `week = min(6, floor(sessions / per) + 1)`.
- Each week lists `per` slots, cycling through the program's days. You can do them in any order or mark one done without logging it.
- Phases: Groove, Build, Build, Push, Peak, Deload. Each style has a set modifier per week (`-1`, `0`, `+1` or `"half"`) and the week's instructions. Adjusted sets: `half` → `ceil(n/2)`, otherwise `n + mod`, minimum 1. Single-set exercises are never modified.

**A/B days.** When a non-Strength program's `perWeek` is greater than its number of days, the second time a day comes up in a week it's the **B** version. That's `programDayB` if it exists. Otherwise every non-core lift swaps to its first doable `rotate` variation that isn't already in the day.

**Rotation between cycles.** From cycle 2, every other exercise (alternating by index and cycle number) swaps to a curated variation. Core lifts (Squat, Deadlift, Bench, OHP) never rotate, and no two exercises pick the same variation. Each exercise steps through its variations as cycles go on: `alts[(floor((n-2)/2)+k) % alts.length]`.

**Suggested weight per lift.** Uses the best set from the last time you did that lift, with `inc` = 5 lb or 2.5 kg.
- Groove week (wk 1): 90% of last weight, rounded to `inc`.
- Deload (wk 6): 70% of last weight (80% for Strength).
- If you hit the top of the rep range: last + `inc`. HIT uses `max(last + inc, round(last × 1.05))`.
- Otherwise: the same weight, and aim for one more rep.

**Default effort % on working sets.** 85 in Groove, 70 in Deload, 100 for HIT, otherwise 90. Warm-ups default to 60 (a setting).

**Rest timer (seconds).** HIT 120, Strength 180, Classic 90, Volume 75, Density 30. Warm-up sets rest 60.

**Guided mode order.** For each group (an exercise plus any `ss` partners): its warm-ups first, then work sets alternating round by round between partners. Moving to a superset partner skips the rest; rest comes after the round.

**Set autofill.** Typing a value carries it down to later sets of that exercise that aren't ticked off and are empty or still hold the old value.

**Weekly streak.** Weeks run Monday to Sunday, and `goal` defaults to the program's `perWeek` (a setting). The streak counts consecutive weeks with at least `goal` sessions, ending this week if the goal is already met, otherwise last week.

**Recap and personal bests.** Estimated 1RM (Epley) is `w × (1 + r/30)`, or reps alone for bodyweight. A personal best means this session's best set beats every earlier logged best for that lift. Volume is `Σ w × r` over working sets.

**Protocol schedules.** `sched.type` is `interval` (every N days from `start`), `weekdays` (days 0–6) or `prn` (as needed), with optional `end` and `paused`.
- Site rotation suggests the site you used least recently for that compound. SubQ: abdomen, thigh and love handle, left and right. IM: glute, delt, quad and ventroglute, left and right.
- Concentration is `vial / water` for reconstituted vials, or the label strength for premixed ones.

**Syringe draw.** `ml = dose / concentration`.
- Syringe types: insulin U-100 0.3 ml (cap 30 units, ticks of 0.5), 0.5 ml (50, ticks of 1), 1 ml (100, ticks of 2); and 1 ml, 3 ml, 5 ml and 10 ml syringes in ml.
- Convert to the syringe's scale (units = ml × 100).
- If the dose doesn't fit, split it into the fewest equal draws that do, then round to the nearest marking.
- If rounding changes the dose, show the actual dose and the percentage error.
- If the dose is smaller than one marking, say so.
- mg ↔ mcg convert; IU never converts.

## 4. Look and feel

The look is dark "glass", the app's Version 2.

| Token | Value |
|---|---|
| Background | `#1B222A` with soft blurred steel-blue and red glows |
| Cards | `rgba(231,231,225,0.07)`, 26 pt blur, 22 pt radius |
| Text / labels | `#E7E7E1` / `rgba(195,204,212,0.78)` |
| Accent | `#39B4F2` (cyan, with a glow on active things) |
| Red | `#E8343B` (warnings, rest timer) |
| Steel | `#33658C` |
| Logo | Four centred bars tapering downward: `#33658C`, `#39B4F2`, `#E7E7E1`, `#E8343B` |
| Fonts | Display Archivo / Archivo Black, UI the system font (SF Pro), numbers IBM Plex Mono |

`.ultraThinMaterial` cards over a dark gradient get close to the glass look. Respect Dynamic Type.

## 5. Data model, and importing the web app's backup

The backup is one JSON object. The fields that matter:

```jsonc
{
  "settings": { "unit": "lb", "warmEff": 60, "sessionMode": "guided", "weekGoal": 6, "look": "v2", "demoDark": true },
  "activeProgram": "arnold-split",
  "equipment": ["barbell", "rack", "..."],
  "cycle": { "n": 1, "programId": "arnold-split", "goal": "size", "start": "2026-11-01", "sessions": 7, "slots": { "1": [0,1,2,3,4,5], "2": [0] }, "rot": {}, "done": false },
  "sessions": [{
    "id": "abc", "date": "2026-11-09", "programId": "arnold-split", "dayName": "Chest & Back B",
    "mins": 52, "cycle": 1, "week": 2,
    "exercises": [{ "name": "Incline DB Press", "sets": [{ "w": "75", "r": "9", "eff": 90 }], "warm": [{ "w": "40", "r": "10", "eff": 60 }] }]
  }],
  "compounds": [{ "id": "c1", "name": "Retatrutide", "kind": "peptide", "dose": "2", "unit": "mg", "route": "SubQ",
    "sched": { "type": "interval", "every": 7 }, "time": "08:00", "start": "2026-10-01", "end": "",
    "mix": { "type": "recon", "vial": "10", "water": "2" }, "syringe": "ins50", "notes": "" }],
  "doses": [{ "id": "d1", "cid": "c1", "date": "2026-11-09", "time": "08:05", "amount": "2", "unit": "mg", "site": "Abdomen L", "note": "" }],
  "weights": [{ "date": "2026-11-09", "w": 185 }]
}
```

Notes:
- Weights and reps are strings in the web app. Parse them to numbers on import.
- Dates are local `YYYY-MM-DD`.
- `weights[]` holds one entry per day, with `w` in the user's unit (`settings.unit`).
- Old exercise names may appear in history. Map them through `exerciseAliases`.
- In SwiftData, the models are `Session → [LoggedExercise] → [LoggedSet]`, `Cycle`, `Compound`, `Dose`, `BodyWeight` and `Settings`.

## 6. What native unlocks (why rebuild)

| Feature | API |
|---|---|
| Rest timer on the lock screen and Dynamic Island | ActivityKit (Live Activities) |
| Dose reminders that actually fire | UserNotifications (local, per compound schedule) |
| Apple Watch: set logging, rest haptics, heart rate | watchOS + WorkoutKit/HealthKit |
| Workouts and bodyweight saved to Apple Health | HealthKit |
| Today's workout and streak on the home screen | WidgetKit |
| Voice cues over music | AVSpeechSynthesizer with an audio-session ducking option |
| Real backups | iCloud (CloudKit-backed SwiftData) |

## 7. Suggested build order (each step teaches one thing)

1. **SwiftUI basics.** Three tabs and a read-only program and exercise browser from `iron77-content.json` (`Codable`, `List`, `NavigationStack`).
2. **Demos.** Async GIF loading with a disk cache.
3. **Logging.** List-mode workout logger, finishing into SwiftData (models, `@Query`, editing).
4. **Logic.** Port section 3 as plain Swift with unit tests (Swift Testing). This is where most bugs hide, so write tests from the web app's behaviour.
5. **Cycles and week view.** A/B days, rotation and phases.
6. **Guided mode.** One set at a time, rest timer, then a Live Activity.
7. **Recap, streak and charts** (Swift Charts).
8. **Stack.** Compounds, schedules, local notifications and the dose calculator.
9. **Import.** The web app's JSON backup, so history carries over.
10. **Extras.** Widgets, HealthKit, then the Watch app.

## 8. Practical notes

- **Installing on your iPhone:** with a free Apple ID, Xcode can install the app on your own phone, but it expires after 7 days and must be reinstalled. The Apple Developer Program ($99/year) gives one-year installs and TestFlight, which is the easy way to share it with a friend.
- **No public App Store:** that's fine for this app. The PED and protocol content and the third-party ExerciseDB animations would both be App Store review problems, and neither matters for personal or TestFlight use.
- **Keep the web app as the reference** until the native app matches it. When content changes in `js/data.js`, rerun `node ios/export-content.js` and copy the JSON across.

## 9. Starter prompt for the iOS project

> I'm learning iOS development by rebuilding my web app IRON77 in SwiftUI (iOS 17+, SwiftData). The attached IOS_HANDOFF.md is the spec and iron77-content.json is the bundled content. Teach as we go: explain new Swift/SwiftUI concepts briefly when we first use them, keep each step small enough to run on my iPhone, and follow the build order in section 7. Start with step 1.
