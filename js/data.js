/* IRON77 — content data. Program details are adapted from published golden-era
   routines; where a source is ambiguous the program is marked "adapted". */

const PROGRAMS = [
  {
    id: 'heavy-duty',
    name: 'Heavy Duty — Ideal Routine',
    legend: 'Mike Mentzer',
    style: 'HIT',
    level: 'Intermediate',
    freq: 'One workout every 4–7 days',
    restDays: 4,
    summary: 'One all-out set per exercise, taken to positive failure, with long recovery between sessions. Pre-exhaust supersets hit the target muscle before the compound lift.',
    principles: [
      'One working set per exercise, after warm-ups. Take it to failure.',
      'Superset pairs (marked ⇄) with zero rest between the two movements.',
      'Rep cadence: about 4 seconds up and 4 seconds down. No momentum.',
      'If you fail to beat your last log, add rest days. Don’t add sets.',
    ],
    days: [
      { name: 'Chest & Back', exercises: [
        { name: 'Pec Deck', sets: 1, reps: '6-10', ss: true },
        { name: 'Incline Press', sets: 1, reps: '1-3', note: 'Immediately after flyes' },
        { name: 'Nautilus Pullover', sets: 1, reps: '6-10', ss: true },
        { name: 'Close-Grip Palms-Up Pulldown', sets: 1, reps: '6-10' },
        { name: 'Deadlift', sets: 1, reps: '5-8' },
      ]},
      { name: 'Legs', exercises: [
        { name: 'Leg Extension', sets: 1, reps: '8-15', ss: true },
        { name: 'Leg Press', sets: 1, reps: '8-15' },
        { name: 'Standing Calf Raise', sets: 1, reps: '12-20' },
      ]},
      { name: 'Shoulders & Arms', exercises: [
        { name: 'DB Lateral Raise', sets: 1, reps: '6-10' },
        { name: 'Bent-Over Lateral Raise', sets: 1, reps: '6-10' },
        { name: 'Barbell Curl', sets: 1, reps: '6-10' },
        { name: 'Triceps Pressdown', sets: 1, reps: '6-10', ss: true },
        { name: 'Dips', sets: 1, reps: '3-5' },
      ]},
    ],
  },
  {
    id: 'consolidation',
    name: 'Heavy Duty — Consolidation',
    legend: 'Mike Mentzer',
    style: 'HIT',
    level: 'Advanced',
    freq: 'One workout every 5–10 days',
    restDays: 5,
    summary: 'Mentzer’s later stripped-down approach: just a few big compound movements and even more recovery. Adapted from his consolidation principles.',
    principles: [
      'Very few exercises. Each set is maximal.',
      'Recovery is where you grow. Rest until you are clearly stronger.',
      'If strength stalls, add rest days rather than work.',
    ],
    days: [
      { name: 'A', exercises: [
        { name: 'Squat', sets: 1, reps: '8-12' },
        { name: 'Dips', sets: 1, reps: '6-10' },
      ]},
      { name: 'B', exercises: [
        { name: 'Deadlift', sets: 1, reps: '5-8' },
        { name: 'Close-Grip Palms-Up Pulldown', sets: 1, reps: '6-10' },
      ]},
    ],
  },
  {
    id: 'colorado',
    name: 'Nautilus Full-Body HIT',
    legend: 'Arthur Jones & Casey Viator',
    style: 'HIT',
    level: 'Beginner–Intermediate',
    freq: '3× per week, full body',
    restDays: 2,
    summary: 'In the spirit of the 1973 Colorado Experiment: brief full-body sessions, one set per exercise, moving fast from station to station.',
    principles: [
      'One set to failure, 8–12 reps, minimal rest between exercises.',
      'Strict form with slow negatives.',
      'Increase the load once you hit the top of the rep range.',
    ],
    days: [
      { name: 'Full Body', exercises: [
        { name: 'Leg Press', sets: 1, reps: '8-12' },
        { name: 'Leg Curl', sets: 1, reps: '8-12' },
        { name: 'Nautilus Pullover', sets: 1, reps: '8-12' },
        { name: 'Chin-Up', sets: 1, reps: '8-12' },
        { name: 'Bench Press', sets: 1, reps: '8-12' },
        { name: 'Overhead Press', sets: 1, reps: '8-12' },
        { name: 'Barbell Curl', sets: 1, reps: '8-12' },
        { name: 'Dips', sets: 1, reps: '8-12' },
        { name: 'Standing Calf Raise', sets: 1, reps: '12-20' },
      ]},
    ],
  },
  {
    id: 'golden-six',
    name: 'The Golden Six',
    legend: 'Arnold Schwarzenegger',
    style: 'Classic',
    level: 'Beginner',
    freq: '3× per week (Mon / Wed / Fri)',
    restDays: 1,
    summary: 'The classic six-exercise, full-body foundation associated with Arnold’s early training. Basic barbell movements, done often.',
    principles: [
      'Add weight once you complete every set with clean reps.',
      'Rest 60–90 seconds between sets.',
      'Master the basics before you specialize.',
    ],
    days: [
      { name: 'Full Body', exercises: [
        { name: 'Squat', sets: 4, reps: '10' },
        { name: 'Wide-Grip Bench Press', sets: 3, reps: '10' },
        { name: 'Chin-Up', sets: 3, reps: 'max' },
        { name: 'Behind-the-Neck Press', sets: 4, reps: '10', note: 'Or front press if shoulders object' },
        { name: 'Barbell Curl', sets: 3, reps: '10' },
        { name: 'Bent-Knee Sit-Up', sets: 3, reps: 'max' },
      ]},
    ],
  },
  {
    id: 'park-5x5',
    name: 'Reg Park 5×5',
    legend: 'Reg Park',
    style: 'Strength',
    level: 'Beginner–Intermediate',
    freq: '3× per week',
    restDays: 1,
    summary: 'Reg Park’s power-building base: heavy compound lifts for 5 sets of 5. The first two sets are progressive warm-ups and the last three are at working weight.',
    principles: [
      'Sets 1–2 are warm-ups. Sets 3–5 are at the same working weight.',
      'When you complete all 3 working sets of 5, add weight next session.',
      'Rest 2–3 minutes between heavy sets.',
    ],
    days: [
      { name: 'Phase I', exercises: [
        { name: 'Squat', sets: 5, reps: '5' },
        { name: 'Bench Press', sets: 5, reps: '5' },
        { name: 'Deadlift', sets: 5, reps: '5' },
      ]},
      { name: 'Phase II', exercises: [
        { name: 'Front Squat', sets: 5, reps: '5' },
        { name: 'Squat', sets: 5, reps: '5' },
        { name: 'Bench Press', sets: 5, reps: '5' },
        { name: 'Behind-the-Neck Press', sets: 5, reps: '5' },
        { name: 'Barbell Row', sets: 5, reps: '5' },
        { name: 'Deadlift', sets: 5, reps: '5' },
      ]},
    ],
  },
  {
    id: 'arnold-split',
    name: 'Arnold\u2019s 6-Day Split',
    legend: 'Arnold & the Gold’s Gym crew',
    style: 'Volume',
    level: 'Advanced',
    freq: '6 days on, 1 off (each day twice per week)',
    restDays: 0,
    summary: 'The high-volume Venice Beach approach: chest and back paired, shoulders and arms together, then legs. Lots of sets, chasing the pump.',
    principles: [
      'Pair antagonists (chest/back, biceps/triceps) for supersets.',
      'Shock the muscle: vary angles, use forced reps and drop sets.',
      'This much volume needs plenty of food and sleep.',
    ],
    days: [
      { name: 'Chest & Back', exercises: [
        { name: 'Bench Press', sets: 5, reps: '6-10' },
        { name: 'Incline Press', sets: 5, reps: '6-10' },
        { name: 'DB Flyes', sets: 4, reps: '8-10' },
        { name: 'Wide-Grip Chin-Up', sets: 5, reps: 'max' },
        { name: 'Barbell Row', sets: 5, reps: '8-10' },
        { name: 'DB Pullover', sets: 4, reps: '10-12' },
      ]},
      { name: 'Shoulders & Arms', exercises: [
        { name: 'Overhead Press', sets: 5, reps: '6-10' },
        { name: 'DB Lateral Raise', sets: 4, reps: '8-12' },
        { name: 'Barbell Curl', sets: 5, reps: '6-10', ss: true },
        { name: 'Close-Grip Bench Press', sets: 5, reps: '6-10' },
        { name: 'Incline DB Curl', sets: 4, reps: '8-10', ss: true },
        { name: 'Lying Triceps Extension', sets: 4, reps: '8-10' },
        { name: 'Wrist Curl', sets: 4, reps: '10-15' },
      ]},
      { name: 'Legs', exercises: [
        { name: 'Squat', sets: 6, reps: '8-12' },
        { name: 'Leg Extension', sets: 5, reps: '10-12' },
        { name: 'Leg Curl', sets: 6, reps: '10-12' },
        { name: 'Stiff-Leg Deadlift', sets: 4, reps: '10' },
        { name: 'Standing Calf Raise', sets: 10, reps: '10' },
        { name: 'Hanging Leg Raise', sets: 4, reps: 'max' },
      ]},
    ],
  },
  {
    id: 'gironda-8x8',
    name: 'Gironda 8×8',
    legend: 'Vince Gironda',
    style: 'Density',
    level: 'Intermediate',
    freq: '3–4 sessions per week, rotating',
    restDays: 1,
    summary: 'The Iron Guru’s "honest workout": 8 sets of 8 with 15–30 seconds of rest, using a weight around 60% of what you’d use for 8 normal reps. Builds density and the pump.',
    principles: [
      'Rest 15–30 seconds between sets. Use a timer.',
      'If you can complete 8×8 on the short rest, add weight.',
      'Choose a moderate weight. The short rest makes it hard.',
    ],
    days: [
      { name: 'Chest, Back & Shoulders', exercises: [
        { name: 'Neck Press', sets: 8, reps: '8' },
        { name: 'Wide-Grip Chin-Up', sets: 8, reps: '8' },
        { name: 'DB Lateral Raise', sets: 8, reps: '8' },
      ]},
      { name: 'Arms', exercises: [
        { name: 'Preacher Curl', sets: 8, reps: '8' },
        { name: 'Triceps Pressdown', sets: 8, reps: '8' },
      ]},
      { name: 'Legs', exercises: [
        { name: 'Hack Squat', sets: 8, reps: '8' },
        { name: 'Leg Curl', sets: 8, reps: '8' },
        { name: 'Standing Calf Raise', sets: 8, reps: '8' },
      ]},
    ],
  },
];

/* ---------- Equipment & exercise library ---------- */
const EQUIPMENT = [
  ['barbell', 'Barbell & plates'], ['rack', 'Squat rack / power rack'], ['bench', 'Flat & incline bench'],
  ['dumbbell', 'Dumbbells'], ['pullup', 'Pull-up / chin-up bar'], ['dip', 'Dip station'],
  ['cable', 'Cable stack / lat pulldown'], ['legpress', 'Leg press'], ['legext', 'Leg extension'],
  ['legcurl', 'Leg curl'], ['calf', 'Standing calf machine'], ['pecdeck', 'Pec deck'],
  ['hack', 'Hack squat machine'], ['preacher', 'Preacher bench'], ['nautilus', 'Nautilus pullover machine'],
];

// Old exercise names → current names (keeps logbook history matching).
const EX_ALIASES = {
  'Pec Deck or DB Flyes': 'Pec Deck', 'Pullover (machine or DB)': 'Nautilus Pullover',
  'Leg Press or Squat': 'Leg Press', 'Back Squat': 'Squat', 'Neck Press (Gironda bench)': 'Neck Press',
};

/* name: [muscle group, equipment needed, alternatives (best first), form cues, classic-footage hint] */
const EXERCISES = {
  // Legs
  'Squat': ['Legs', ['barbell', 'rack'], ['Leg Press', 'Goblet Squat', 'Bulgarian Split Squat'],
    ['Bar on upper traps, feet shoulder-width, toes slightly out.', 'Break at hips and knees together; keep chest up and back tight.', 'Descend to at least parallel, then drive up through mid-foot.'], 'Tom Platz squat'],
  'Front Squat': ['Legs', ['barbell', 'rack'], ['Goblet Squat', 'Squat', 'Leg Press'],
    ['Bar rests on front delts, elbows high.', 'Stay upright; sit straight down between your heels.', 'Keep elbows up all the way out of the hole.'], 'golden era front squat'],
  'Leg Press': ['Legs', ['legpress'], ['Squat', 'Goblet Squat', 'Bulgarian Split Squat'],
    ['Feet mid-platform, shoulder-width.', 'Lower until knees are near your chest without your lower back rounding off the pad.', 'Press through heels; don’t lock the knees hard at the top.'], 'Mike Mentzer leg press'],
  'Hack Squat': ['Legs', ['hack'], ['Front Squat', 'Leg Press', 'Goblet Squat'],
    ['Back flat on the pad, feet low-to-mid platform.', 'Descend deep under control.', 'Drive up without letting the hips lift off the pad.'], 'Vince Gironda hack squat'],
  'Goblet Squat': ['Legs', ['dumbbell'], ['Bulgarian Split Squat', 'Sissy Squat'],
    ['Hold one dumbbell vertically at your chest.', 'Sit between your heels, elbows inside the knees.', 'Pause at the bottom, then stand tall.'], ''],
  'Bulgarian Split Squat': ['Legs', ['dumbbell', 'bench'], ['Goblet Squat'],
    ['Rear foot on a bench, front foot a stride ahead.', 'Drop the back knee straight down.', 'Drive through the front heel. Do all reps, then switch legs.'], ''],
  'Sissy Squat': ['Legs', [], ['Bulgarian Split Squat', 'Goblet Squat'],
    ['Hold a support, rise onto your toes.', 'Lean back as your knees travel forward; hips stay extended.', 'Go as low as your knees allow, then return. Gironda’s quad isolator.'], 'Vince Gironda sissy squat'],
  'Leg Extension': ['Legs', ['legext'], ['Sissy Squat', 'Bulgarian Split Squat'],
    ['Knees in line with the machine pivot.', 'Extend fully and squeeze the quads for a beat.', 'Lower slowly, about 4 seconds.'], 'Mike Mentzer leg extension'],
  'Leg Curl': ['Legs', ['legcurl'], ['DB Leg Curl', 'Stiff-Leg Deadlift', 'DB Romanian Deadlift'],
    ['Pad just above the heels, knees off the bench edge.', 'Curl to full contraction, hips pressed down.', 'Lower slowly. Don’t let the weight stack slam.'], 'golden era leg curl'],
  'DB Leg Curl': ['Legs', ['dumbbell', 'bench'], ['DB Romanian Deadlift'],
    ['Lie face down, a dumbbell squeezed between your feet.', 'Curl it up slowly, keeping hips on the bench.', 'Use a light weight; control matters more than load.'], ''],
  'Stiff-Leg Deadlift': ['Legs', ['barbell'], ['DB Romanian Deadlift', 'Leg Curl'],
    ['Soft knees, bar close to the legs.', 'Push the hips back until you feel a deep hamstring stretch.', 'Keep your back flat; stand by driving hips forward.'], 'golden era stiff leg deadlift'],
  'DB Romanian Deadlift': ['Legs', ['dumbbell'], ['Stiff-Leg Deadlift'],
    ['Dumbbells in front of the thighs, soft knees.', 'Hinge at the hips, sliding the weights down your legs.', 'Back flat; return by squeezing glutes.'], ''],
  'Standing Calf Raise': ['Legs', ['calf'], ['Single-Leg DB Calf Raise'],
    ['Balls of feet on the block, legs nearly straight.', 'Full stretch at the bottom: pause.', 'Rise as high as possible and hold the peak.'], 'Arnold calf raise'],
  'Single-Leg DB Calf Raise': ['Legs', ['dumbbell'], [],
    ['Stand on one foot on a step, dumbbell in the same-side hand.', 'Deep stretch at the bottom, full rise at the top.', 'All reps one leg, then switch.'], ''],
  // Back
  'Deadlift': ['Back', ['barbell'], ['DB Romanian Deadlift'],
    ['Bar over mid-foot, shins close, grip just outside the legs.', 'Brace hard, chest up, back flat.', 'Push the floor away; bar stays against your legs. Lock out with the glutes.'], 'Franco Columbu deadlift'],
  'Barbell Row': ['Back', ['barbell'], ['One-Arm DB Row'],
    ['Hinge to about 45°, back flat.', 'Row the bar to your lower ribs, elbows back.', 'Lower under control. No heaving.'], 'Arnold barbell row'],
  'One-Arm DB Row': ['Back', ['dumbbell', 'bench'], ['Barbell Row'],
    ['Knee and hand on the bench, back flat.', 'Pull the dumbbell toward your hip.', 'Full stretch at the bottom.'], ''],
  'Chin-Up': ['Back', ['pullup'], ['Close-Grip Palms-Up Pulldown'],
    ['Palms facing you, shoulder-width.', 'Pull your chest toward the bar, elbows down and back.', 'Lower all the way to a dead hang.'], 'golden era chin ups'],
  'Wide-Grip Chin-Up': ['Back', ['pullup'], ['Wide-Grip Pulldown', 'Chin-Up'],
    ['Overhand grip, wider than shoulders.', 'Pull up until chin clears the bar (or behind the neck, old-school style, if shoulders allow).', 'Stretch the lats fully at the bottom.'], 'Arnold wide grip chin ups'],
  'Wide-Grip Pulldown': ['Back', ['cable'], ['Wide-Grip Chin-Up'],
    ['Wide overhand grip, thighs locked under the pad.', 'Pull the bar to your upper chest, leaning back slightly.', 'Let the lats stretch fully on the way up.'], ''],
  'Close-Grip Palms-Up Pulldown': ['Back', ['cable'], ['Chin-Up'],
    ['Underhand grip about 6 inches apart.', 'Pull to the upper chest, elbows driving down.', 'Slow 4-second return to a full stretch.'], 'Mike Mentzer close grip pulldown'],
  'Nautilus Pullover': ['Back', ['nautilus'], ['DB Pullover', 'Straight-Arm Pulldown'],
    ['Adjust the seat so shoulders line up with the cam.', 'Elbows on the pads; drive them down and around to your stomach.', 'Return slowly into a deep lat stretch.'], 'Mike Mentzer nautilus pullover'],
  'DB Pullover': ['Back', ['dumbbell', 'bench'], ['Straight-Arm Pulldown'],
    ['Lie across or along a bench, one dumbbell held over your chest.', 'Lower it behind your head with slightly bent arms.', 'Feel the lat and ribcage stretch, then pull back over.'], 'Arnold dumbbell pullover'],
  'Straight-Arm Pulldown': ['Back', ['cable'], ['DB Pullover'],
    ['Face a high cable, arms nearly straight.', 'Sweep the bar down to your thighs using the lats.', 'Slow return overhead.'], ''],
  // Chest
  'Bench Press': ['Chest', ['barbell', 'bench'], ['DB Bench Press', 'Push-Up'],
    ['Shoulder blades pinched, feet planted.', 'Lower the bar to mid-chest under control.', 'Press up and slightly back. Use a spotter when going heavy.'], 'Arnold bench press'],
  'Wide-Grip Bench Press': ['Chest', ['barbell', 'bench'], ['DB Bench Press', 'Push-Up'],
    ['Grip a little wider than usual.', 'Lower to the chest, elbows out, for a big pec stretch.', 'Press up without bouncing.'], 'golden era bench press'],
  'Incline Press': ['Chest', ['barbell', 'bench'], ['Incline DB Press'],
    ['Bench at 30–45°.', 'Lower the bar to your upper chest.', 'Press straight up. In Heavy Duty, do this immediately after flyes.'], 'Mike Mentzer incline press'],
  'Neck Press': ['Chest', ['barbell', 'bench'], ['Wide-Grip Bench Press', 'Incline DB Press'],
    ['Gironda’s chest builder: wide grip, elbows flared.', 'Lower the bar slowly to the base of your neck.', 'Use a light weight and a spotter. Skip it if your shoulders object.'], 'Vince Gironda neck press'],
  'DB Bench Press': ['Chest', ['dumbbell', 'bench'], ['Push-Up'],
    ['Dumbbells at chest level, palms forward.', 'Press up and slightly together.', 'Lower deep for a full stretch.'], ''],
  'Incline DB Press': ['Chest', ['dumbbell', 'bench'], ['DB Bench Press'],
    ['Bench at 30–45°.', 'Press up over the upper chest.', 'Lower slowly to a deep stretch.'], ''],
  'Pec Deck': ['Chest', ['pecdeck'], ['DB Flyes', 'Cable Crossover'],
    ['Seat so handles are at chest height.', 'Squeeze the arms together; hold the contraction.', 'Return slowly to a full stretch. Pre-exhausts before presses.'], 'Mike Mentzer pec deck'],
  'DB Flyes': ['Chest', ['dumbbell', 'bench'], ['Cable Crossover', 'Pec Deck'],
    ['Slight bend in the elbows, locked in place.', 'Open wide in an arc to a deep stretch.', 'Hug the weights back up over the chest.'], 'Arnold dumbbell flyes'],
  'Cable Crossover': ['Chest', ['cable'], ['DB Flyes'],
    ['Stand between high pulleys, slight lean forward.', 'Sweep the hands down and together.', 'Squeeze, then return slowly.'], 'golden era cable crossover'],
  'Dips': ['Chest', ['dip'], ['Bench Dips', 'Close-Grip Bench Press'],
    ['Lean forward for chest, stay upright for triceps.', 'Lower until upper arms are about parallel.', 'Press up to lockout. Mentzer used these right after pressdowns.'], 'Mike Mentzer dips'],
  'Push-Up': ['Chest', [], ['Bench Dips'],
    ['Hands just wider than shoulders, body rigid.', 'Chest to the floor.', 'Press up fully. Elevate your feet to make it harder.'], ''],
  // Shoulders
  'Overhead Press': ['Shoulders', ['barbell'], ['Seated DB Press'],
    ['Bar at the collarbone, grip just outside the shoulders.', 'Squeeze glutes and press straight up.', 'Head through at the top.'], 'golden era military press'],
  'Behind-the-Neck Press': ['Shoulders', ['barbell'], ['Overhead Press', 'Seated DB Press'],
    ['Only if you can comfortably get the bar behind your head.', 'Lower to ear level, not lower.', 'Press up smoothly. Swap for front press if shoulders complain.'], 'Reg Park behind the neck press'],
  'Seated DB Press': ['Shoulders', ['dumbbell', 'bench'], ['Overhead Press'],
    ['Upright bench, dumbbells at ear level.', 'Press up and slightly together.', 'Lower to a full stretch.'], 'Arnold press'],
  'DB Lateral Raise': ['Shoulders', ['dumbbell'], ['Cable Lateral Raise'],
    ['Slight forward lean, slight elbow bend.', 'Raise out to the sides to shoulder height, pinkies slightly up.', 'Lower slowly. No swinging.'], 'Mike Mentzer lateral raise'],
  'Cable Lateral Raise': ['Shoulders', ['cable'], ['DB Lateral Raise'],
    ['Low pulley, handle in the far hand.', 'Raise out to shoulder height.', 'Constant tension: lower slowly.'], ''],
  'Bent-Over Lateral Raise': ['Shoulders', ['dumbbell'], ['Reverse Pec Deck'],
    ['Bend over until your torso is almost parallel to the floor.', 'Raise the dumbbells out wide, leading with the elbows.', 'Squeeze the rear delts; lower slowly.'], 'golden era rear delt raise'],
  'Reverse Pec Deck': ['Shoulders', ['pecdeck'], ['Bent-Over Lateral Raise'],
    ['Face the pad, handles at shoulder height.', 'Sweep the arms back, squeezing rear delts.', 'Slow return.'], ''],
  // Arms
  'Barbell Curl': ['Arms', ['barbell'], ['DB Curl'],
    ['Elbows pinned to your sides.', 'Curl to full contraction without leaning back.', 'Lower slowly to a full stretch.'], 'Arnold barbell curl'],
  'DB Curl': ['Arms', ['dumbbell'], ['Concentration Curl'],
    ['Palms forward or turn them up as you curl.', 'Squeeze at the top.', 'Lower under control.'], ''],
  'Incline DB Curl': ['Arms', ['dumbbell', 'bench'], ['DB Curl'],
    ['Bench at about 45°, arms hanging straight down.', 'Curl without moving the elbows forward.', 'Big stretch at the bottom.'], 'Arnold incline curl'],
  'Preacher Curl': ['Arms', ['preacher'], ['Concentration Curl', 'Barbell Curl'],
    ['Armpits snug over the pad.', 'Curl up; stop just short of vertical.', 'Lower slowly, but not to a hard lockout.'], 'Larry Scott preacher curl'],
  'Concentration Curl': ['Arms', ['dumbbell'], ['DB Curl'],
    ['Seated, elbow braced against the inner thigh.', 'Curl up and twist the pinky up at the top.', 'Slow lowering.'], 'Arnold concentration curl'],
  'Triceps Pressdown': ['Arms', ['cable'], ['Lying Triceps Extension', 'Bench Dips'],
    ['Elbows pinned to your sides.', 'Push down to full lockout; squeeze.', 'Return until forearms are just past parallel.'], 'Mike Mentzer triceps pushdown'],
  'Lying Triceps Extension': ['Arms', ['barbell', 'bench'], ['Overhead DB Extension'],
    ['Lie on a bench, bar (EZ bar if you have one) over your forehead.', 'Bend only at the elbows to lower the bar.', 'Extend back up; elbows stay in.'], 'golden era skull crushers'],
  'Close-Grip Bench Press': ['Arms', ['barbell', 'bench'], ['Dips', 'Push-Up'],
    ['Hands about shoulder-width.', 'Elbows tucked as you lower to the lower chest.', 'Press with the triceps.'], ''],
  'Overhead DB Extension': ['Arms', ['dumbbell'], ['Bench Dips'],
    ['Hold one dumbbell overhead with both hands.', 'Lower behind your head, elbows pointing up.', 'Extend fully.'], ''],
  'Bench Dips': ['Arms', ['bench'], ['Push-Up'],
    ['Hands on the bench edge behind you, legs out.', 'Lower until elbows reach 90°.', 'Press back up.'], ''],
  'Wrist Curl': ['Arms', ['barbell'], ['DB Wrist Curl'],
    ['Forearms on your thighs or a bench, palms up.', 'Let the bar roll to your fingertips.', 'Curl it back up with the wrists only.'], 'golden era forearm training'],
  'DB Wrist Curl': ['Arms', ['dumbbell'], [],
    ['Forearms on your thighs, palms up.', 'Roll the dumbbells to the fingertips.', 'Curl back up.'], ''],
  // Abs
  'Bent-Knee Sit-Up': ['Abs', [], ['Lying Leg Raise'],
    ['Knees bent, feet anchored.', 'Curl up one vertebra at a time.', 'Lower slowly; don’t yank your neck.'], 'golden era sit ups'],
  'Hanging Leg Raise': ['Abs', ['pullup'], ['Lying Leg Raise'],
    ['Dead hang from the bar.', 'Raise knees or straight legs by curling the pelvis up.', 'Lower without swinging.'], 'Frank Zane leg raises'],
  'Lying Leg Raise': ['Abs', [], ['Bent-Knee Sit-Up'],
    ['Lie flat, hands under your hips.', 'Raise legs to vertical.', 'Lower slowly, stopping just above the floor.'], ''],
};

/* ---------- Compound library for protocol search ----------
   [name, kind, route, unit, vial type ('recon' powder | 'premix' liquid | ''), search aliases, note]
   Doses are deliberately NOT included: IRON77 tracks, it doesn't prescribe. */
const COMPOUNDS = [
  // GLP-1 and metabolic peptides
  ['Retatrutide', 'peptide', 'SubQ', 'mg', 'recon', 'reta glp-1 glp1 triple agonist', ''],
  ['Tirzepatide', 'peptide', 'SubQ', 'mg', 'recon', 'mounjaro zepbound tirz glp-1 glp1', 'Pens are pre-filled; vials are usually powder.'],
  ['Semaglutide', 'peptide', 'SubQ', 'mg', 'recon', 'ozempic wegovy sema glp-1 glp1', 'Pens are pre-filled; vials are usually powder.'],
  ['Cagrilintide', 'peptide', 'SubQ', 'mg', 'recon', 'cagri amylin', ''],
  ['Mazdutide', 'peptide', 'SubQ', 'mg', 'recon', 'glp-1 glp1', ''],
  ['AOD-9604', 'peptide', 'SubQ', 'mcg', 'recon', 'aod fat loss', ''],
  ['MOTS-c', 'peptide', 'SubQ', 'mg', 'recon', 'mots mitochondrial', ''],
  ['5-Amino-1MQ', 'peptide', 'Oral', 'mg', '', '5 amino 1mq nnmt', ''],
  // Healing / recovery peptides
  ['BPC-157', 'peptide', 'SubQ', 'mcg', 'recon', 'bpc body protection compound healing', ''],
  ['TB-500', 'peptide', 'SubQ', 'mg', 'recon', 'tb500 thymosin beta-4 tb4 healing', ''],
  ['GHK-Cu', 'peptide', 'SubQ', 'mg', 'recon', 'ghk copper peptide skin', ''],
  ['KPV', 'peptide', 'SubQ', 'mcg', 'recon', 'anti-inflammatory', ''],
  ['Thymosin Alpha-1', 'peptide', 'SubQ', 'mg', 'recon', 'ta1 ta-1 immune', ''],
  ['LL-37', 'peptide', 'SubQ', 'mcg', 'recon', 'll37 immune', ''],
  // Growth hormone axis
  ['Ipamorelin', 'peptide', 'SubQ', 'mcg', 'recon', 'ipa ghrp gh secretagogue', ''],
  ['CJC-1295 (no DAC)', 'peptide', 'SubQ', 'mcg', 'recon', 'cjc mod grf 1-29 modgrf', ''],
  ['CJC-1295 with DAC', 'peptide', 'SubQ', 'mg', 'recon', 'cjc dac', ''],
  ['CJC-1295 / Ipamorelin blend', 'peptide', 'SubQ', 'mcg', 'recon', 'cjc ipa blend stack', ''],
  ['Sermorelin', 'peptide', 'SubQ', 'mcg', 'recon', 'ghrh', ''],
  ['Tesamorelin', 'peptide', 'SubQ', 'mg', 'recon', 'egrifta tesa ghrh', ''],
  ['GHRP-2', 'peptide', 'SubQ', 'mcg', 'recon', 'ghrp2', ''],
  ['GHRP-6', 'peptide', 'SubQ', 'mcg', 'recon', 'ghrp6', ''],
  ['Hexarelin', 'peptide', 'SubQ', 'mcg', 'recon', 'hex', ''],
  ['MK-677 (Ibutamoren)', 'medication', 'Oral', 'mg', '', 'mk677 mk 677 ibutamoren nutrobal', ''],
  ['HGH (Somatropin)', 'hormone', 'SubQ', 'IU', 'recon', 'gh growth hormone somatropin genotropin norditropin omnitrope', 'Dosed in IU. Check the IU per vial on your box.'],
  ['IGF-1 LR3', 'peptide', 'SubQ', 'mcg', 'recon', 'igf igf1', ''],
  // Other peptides
  ['PT-141 (Bremelanotide)', 'peptide', 'SubQ', 'mg', 'recon', 'pt141 bremelanotide vyleesi libido', ''],
  ['Melanotan II', 'peptide', 'SubQ', 'mcg', 'recon', 'mt2 mt-2 tanning', ''],
  ['Kisspeptin-10', 'peptide', 'SubQ', 'mcg', 'recon', 'kisspeptin', ''],
  ['Selank', 'peptide', 'Other', 'mcg', 'recon', 'nasal nootropic', 'Often taken as a nasal spray.'],
  ['Semax', 'peptide', 'Other', 'mcg', 'recon', 'nasal nootropic', 'Often taken as a nasal spray.'],
  ['Epitalon', 'peptide', 'SubQ', 'mg', 'recon', 'epithalon longevity', ''],
  ['DSIP', 'peptide', 'SubQ', 'mcg', 'recon', 'delta sleep', ''],
  ['NAD+', 'supplement', 'SubQ', 'mg', 'recon', 'nad nicotinamide', 'Also taken as IV or oral precursors (NMN, NR).'],
  // Testosterone and hormones
  ['Testosterone Cypionate', 'hormone', 'IM', 'mg', 'premix', 'test cyp trt depo-testosterone', 'Vials are usually 200 mg/ml (sometimes 250). Check your label.'],
  ['Testosterone Enanthate', 'hormone', 'IM', 'mg', 'premix', 'test e test enan trt xyosted', 'Vials are usually 250 mg/ml. Check your label.'],
  ['Testosterone Propionate', 'hormone', 'IM', 'mg', 'premix', 'test prop', 'Check the mg/ml on your label.'],
  ['Testosterone Undecanoate (oral)', 'hormone', 'Oral', 'mg', '', 'jatenzo kyzatrex tlando test u', ''],
  ['Testosterone Gel / Cream', 'hormone', 'Topical', 'mg', '', 'androgel testim cream trt topical', ''],
  ['HCG', 'hormone', 'SubQ', 'IU', 'recon', 'hcg pregnyl novarel human chorionic gonadotropin', 'Dosed in IU. Check the IU per vial on your box.'],
  ['Nandrolone Decanoate', 'hormone', 'IM', 'mg', 'premix', 'deca nandrolone', 'Check the mg/ml on your label.'],
  ['Trenbolone Enanthate', 'hormone', 'IM', 'mg', 'premix', 'tren e', 'Check the mg/ml on your label.'],
  ['Trenbolone Acetate', 'hormone', 'IM', 'mg', 'premix', 'tren a', 'Check the mg/ml on your label.'],
  ['Boldenone Undecylenate', 'hormone', 'IM', 'mg', 'premix', 'eq equipoise', 'Check the mg/ml on your label.'],
  ['Drostanolone (Masteron)', 'hormone', 'IM', 'mg', 'premix', 'mast masteron', 'Check the mg/ml on your label.'],
  ['Oxandrolone', 'hormone', 'Oral', 'mg', '', 'anavar var', ''],
  ['DHEA', 'hormone', 'Oral', 'mg', '', 'dhea', ''],
  ['Pregnenolone', 'hormone', 'Oral', 'mg', '', 'preg', ''],
  ['Levothyroxine (T4)', 'medication', 'Oral', 'mcg', '', 'synthroid t4 thyroid', ''],
  ['Liothyronine (T3)', 'medication', 'Oral', 'mcg', '', 'cytomel t3 thyroid', ''],
  // Ancillary medications
  ['Anastrozole', 'medication', 'Oral', 'mg', '', 'arimidex adex ai aromatase inhibitor', ''],
  ['Letrozole', 'medication', 'Oral', 'mg', '', 'femara ai aromatase inhibitor', ''],
  ['Exemestane', 'medication', 'Oral', 'mg', '', 'aromasin ai aromatase inhibitor', ''],
  ['Enclomiphene', 'medication', 'Oral', 'mg', '', 'enclo serm', ''],
  ['Clomiphene', 'medication', 'Oral', 'mg', '', 'clomid serm pct', ''],
  ['Tamoxifen', 'medication', 'Oral', 'mg', '', 'nolvadex nolva serm pct', ''],
  ['Cabergoline', 'medication', 'Oral', 'mg', '', 'dostinex caber prolactin', ''],
  ['Finasteride', 'medication', 'Oral', 'mg', '', 'propecia proscar hair', ''],
  ['Dutasteride', 'medication', 'Oral', 'mg', '', 'avodart hair', ''],
  ['Minoxidil', 'medication', 'Topical', 'ml', '', 'rogaine hair', 'Also available as oral tablets.'],
  ['Tadalafil', 'medication', 'Oral', 'mg', '', 'cialis', ''],
  ['Metformin', 'medication', 'Oral', 'mg', '', 'glucophage', ''],
  ['Telmisartan', 'medication', 'Oral', 'mg', '', 'micardis blood pressure', ''],
  ['Rosuvastatin', 'medication', 'Oral', 'mg', '', 'crestor statin cholesterol', ''],
  ['Ezetimibe', 'medication', 'Oral', 'mg', '', 'zetia cholesterol', ''],
  ['Low-dose aspirin', 'medication', 'Oral', 'mg', '', 'aspirin', ''],
  // Supplements
  ['Creatine Monohydrate', 'supplement', 'Oral', 'g', '', 'creatine', ''],
  ['Whey Protein', 'supplement', 'Oral', 'g', '', 'protein shake whey', ''],
  ['Vitamin D3', 'supplement', 'Oral', 'IU', '', 'vit d d3 cholecalciferol', ''],
  ['Vitamin K2', 'supplement', 'Oral', 'mcg', '', 'k2 mk-7', ''],
  ['Fish Oil (Omega-3)', 'supplement', 'Oral', 'g', '', 'omega epa dha', ''],
  ['Magnesium Glycinate', 'supplement', 'Oral', 'mg', '', 'magnesium mag', ''],
  ['Zinc', 'supplement', 'Oral', 'mg', '', 'zinc', ''],
  ['Boron', 'supplement', 'Oral', 'mg', '', 'boron', ''],
  ['Multivitamin', 'supplement', 'Oral', 'tabs', '', 'multi', ''],
  ['Ashwagandha', 'supplement', 'Oral', 'mg', '', 'ksm-66 adaptogen', ''],
  ['Tongkat Ali', 'supplement', 'Oral', 'mg', '', 'longjack', ''],
  ['Citrus Bergamot', 'supplement', 'Oral', 'mg', '', 'bergamot cholesterol', ''],
  ['Berberine', 'supplement', 'Oral', 'mg', '', 'berberine', ''],
  ['NAC', 'supplement', 'Oral', 'mg', '', 'n-acetyl cysteine', ''],
  ['TUDCA', 'supplement', 'Oral', 'mg', '', 'liver support', ''],
  ['L-Citrulline', 'supplement', 'Oral', 'g', '', 'citrulline pump', ''],
  ['Beta-Alanine', 'supplement', 'Oral', 'g', '', 'beta alanine', ''],
  ['Caffeine', 'supplement', 'Oral', 'mg', '', 'pre-workout coffee', ''],
  ['Electrolytes', 'supplement', 'Oral', 'g', '', 'sodium potassium lmnt', ''],
  ['Collagen', 'supplement', 'Oral', 'g', '', 'collagen peptides', ''],
  ['Psyllium Husk', 'supplement', 'Oral', 'g', '', 'fiber metamucil', ''],
  ['Melatonin', 'supplement', 'Oral', 'mg', '', 'sleep', ''],
  ['Desiccated Liver Tablets', 'supplement', 'Oral', 'tabs', '', 'liver gironda', ''],
  ['Brewer’s Yeast', 'supplement', 'Oral', 'g', '', 'yeast', ''],
];

/* ---------- Exercise demo animations ----------
   Animated GIFs from ExerciseDB's free API (exercisedb.dev), loaded from their hosted copy
   and cached on the device; IRON77 doesn't re-host them. */
const DEMO_BASE = 'https://static.exercisedb.dev/media/';
const EX_DEMO = {
  "Squat": "qXTaZnJ",
  "Front Squat": "zG0zs85",
  "Leg Press": "10Z2DXU",
  "Hack Squat": "Qa55kX1",
  "Goblet Squat": "yn8yg1r",
  "Bulgarian Split Squat": "qx4fgX7",
  "Sissy Squat": "xdYPUtE",
  "Leg Extension": "my33uHU",
  "Leg Curl": "17lJ1kr",
  "DB Leg Curl": "FkBIE6a",
  "Stiff-Leg Deadlift": "wQ2c4XD",
  "DB Romanian Deadlift": "rR0LJzx",
  "Standing Calf Raise": "ykUOVze",
  "Single-Leg DB Calf Raise": "1kB3Wmk",
  "Deadlift": "ila4NZS",
  "Barbell Row": "eZyBC3j",
  "One-Arm DB Row": "C0MA9bC",
  "Chin-Up": "T2mxWqc",
  "Wide-Grip Chin-Up": "Qqi7bko",
  "Wide-Grip Pulldown": "qdRxqCj",
  "Close-Grip Palms-Up Pulldown": "ecpY0rH",
  "Nautilus Pullover": "4U7iLb5",
  "DB Pullover": "9XjtHvS",
  "Straight-Arm Pulldown": "x69MAlq",
  "Bench Press": "EIeI8Vf",
  "Wide-Grip Bench Press": "JsKq9so",
  "Incline Press": "3TZduzM",
  "Neck Press": "GXoaSgn",
  "DB Bench Press": "SpYC0Kp",
  "Incline DB Press": "ns0SIbU",
  "Pec Deck": "v3xmPAR",
  "DB Flyes": "yz9nUhF",
  "Cable Crossover": "0CXGHya",
  "Dips": "9WTm7dq",
  "Push-Up": "I4hDWkc",
  "Overhead Press": "wdRZISl",
  "Behind-the-Neck Press": "xDh0lJr",
  "Seated DB Press": "znQUdHY",
  "DB Lateral Raise": "DsgkuIt",
  "Cable Lateral Raise": "goJ6ezq",
  "Bent-Over Lateral Raise": "v1qBec9",
  "Reverse Pec Deck": "xiHiJcA",
  "Barbell Curl": "25GPyDY",
  "DB Curl": "3s4NnTh",
  "Incline DB Curl": "ae9UoXQ",
  "Preacher Curl": "qOgPVf6",
  "Concentration Curl": "gvsWLQw",
  "Triceps Pressdown": "gAwDzB3",
  "Lying Triceps Extension": "h8LFzo9",
  "Close-Grip Bench Press": "J6Dx1Mu",
  "Overhead DB Extension": "PdmaD0N",
  "Bench Dips": "MU9HnE7",
  "Wrist Curl": "82LxxkW",
  "DB Wrist Curl": "2dImyQ8",
  "Bent-Knee Sit-Up": "AR0ig3o",
  "Hanging Leg Raise": "I3tsCnC",
  "Lying Leg Raise": "WhuFnR7",
};

/* ---------- Workout-day notes: short brief + logistics + philosophy ----------
   Keyed by "programId|day name". */
const DAY_NOTES = {
  'heavy-duty|Chest & Back': {
    brief: 'Pre-exhaust day: flyes straight into incline presses, pullovers straight into pulldowns, then one heavy deadlift. Five all-out sets, and every one has to count.',
    logistics: 'Plan on 15–20 minutes. Warm up with one or two light sets of the first movement in each pair. Set the incline bench next to the pec deck (or flye bench) and the pulldown next to the pullover, so you can switch with no rest. Do the deadlift last, after a proper warm-up ramp, and rest 2–3 minutes before it. Log every set: next time you need one more rep or a little more weight.',
    philosophy: 'Pre-exhaustion gets around the weak link. In a press or a pulldown your arms give out before your chest or lats are fully worked. Isolating the big muscle first and going straight into the compound lift lets your fresh arms drive the already-tired target past where it could go on its own. Mentzer’s point was that the stimulus is the intensity of the set, not the number of sets: one true failure set signals growth, and anything more only digs a deeper recovery hole.',
  },
  'heavy-duty|Legs': {
    brief: 'Leg extensions straight into leg presses, then calves. Short and brutal, done in 10–15 minutes.',
    logistics: 'Warm up with a light set of extensions and leg presses. Load the leg press before you start the extensions, because the switch has to be immediate. Calves come last, with a full stretch at the bottom and a pause at the top. Expect the superset to wipe you out: rest as long as you need before calves.',
    philosophy: 'The extensions exhaust the quads in isolation; the leg press then lets your hips and glutes push the quads beyond failure. Legs are your biggest muscles and draw hardest on recovery, which is why Mentzer gave them a day of their own and kept it brief.',
  },
  'heavy-duty|Shoulders & Arms': {
    brief: 'Side and rear delts, then curls, then pressdowns straight into dips. Isolation work, all to failure.',
    logistics: 'About 15 minutes. Use moderate weight and strict form on the laterals, since shoulders cheat easily. Put the dip station next to the pressdown so the switch is instant. Rest 1–2 minutes between unpaired movements.',
    philosophy: 'Your arms and shoulders already got indirect work on chest and back day, so they only need a little direct stimulus here. Small muscles recover quickly but your overall system doesn’t, so keep it short and let the logbook tell you whether you’re growing.',
  },
  'consolidation|A': {
    brief: 'Squats and dips, one all-out set each. The bare essentials of Mentzer’s later method.',
    logistics: 'Ten minutes of work after a thorough warm-up. Ramp up on squats with 3–4 progressively heavier warm-up sets, then take one set to failure in the 8–12 range. Rest fully, then one set of dips. Use a safety rack or a spotter for the squat.',
    philosophy: 'Late in his career Mentzer concluded that most people overtrain even on brief programs. Consolidation trains the whole body with a couple of big movements and long rests between workouts. If you aren’t stronger every session, you add rest, not work.',
  },
  'consolidation|B': {
    brief: 'Deadlifts and close-grip pulldowns: two movements, maximum effort, then a long rest.',
    logistics: 'Warm up the deadlift carefully with several ramping sets. The working set is 5–8 reps with perfect form; end the set when your form starts to break, not after it has. Rest a few minutes, then one set of pulldowns to failure.',
    philosophy: 'The deadlift taxes nearly every muscle in your body, and your recovery along with it, which is why it stands almost alone here. Fewer workouts, each one heavier than the last: that is the whole idea.',
  },
  'colorado|Full Body': {
    brief: 'Nine stations, one set each, moving quickly from one to the next so your heart rate stays high.',
    logistics: 'About 25–30 minutes. Set up all the stations in order before you start so there’s almost no rest between them. Do 8–12 reps per exercise with slow negatives. If you need a breather between the leg work and the upper body, take it, but keep it short.',
    philosophy: 'Arthur Jones believed intensity, not volume, drives growth, and that the whole body should be worked in sequence, to failure, in one session. Casey Viator’s Colorado Experiment results (debated as they are) made the case that brief, hard full-body training could build size fast.',
  },
  'golden-six|Full Body': {
    brief: 'The six classic basics, 3–4 sets each. A full-body foundation, three times a week.',
    logistics: 'About 45–60 minutes. Rest 60–90 seconds between sets. Squat first while you’re fresh, keep the behind-the-neck press light (or switch to a front press if your shoulders object), and finish with sit-ups. Add weight once every set hits 10 clean reps.',
    philosophy: 'Before split routines and specialisation, champions built their base on a handful of compound lifts done often. The goal is skill and strength on the basics; size follows from that.',
  },
  'park-5x5|Phase I': {
    brief: 'Squat, bench and deadlift for 5×5: two build-up sets, then three heavy working sets.',
    logistics: 'About 45 minutes. Sets 1 and 2 are warm-ups rising to your working weight; sets 3–5 are all at that weight. Rest 2–3 minutes between heavy sets, and use a rack with safety bars for squat and bench. When you get 5 reps on all three working sets, add weight next time.',
    philosophy: 'Reg Park’s base for raw strength and mass. He believed a bodybuilder should be strong first, and that a physique is built on numbers going up on the basic lifts.',
  },
  'park-5x5|Phase II': {
    brief: 'Six lifts at 5×5: more volume on the same heavy basics, once Phase I has built your base.',
    logistics: 'About 75 minutes. Same pattern: two build-up sets, then three working sets. Front squats come first, then back squats, so take your time warming up. The press and row bring in your shoulders and upper back. Rest 2–3 minutes between heavy sets.',
    philosophy: 'Once the big three were moving well, Park added more basic movements to round out the physique while keeping the heavy 5-rep work. It is still a strength program at heart: progress is measured in weight on the bar.',
  },
  'arnold-split|Chest & Back': {
    brief: 'Big chest and back volume, pairing pushes with pulls. Chase the pump.',
    logistics: 'About 60–75 minutes. Pair a chest movement with a back movement (bench with chins, incline with rows) and alternate between them with 60–75 seconds’ rest. Use the full range of motion, with a deep stretch on the flyes and pullovers.',
    philosophy: 'The Venice Beach approach: high volume, frequent training and the pump. Arnold paired opposing muscles so one rested while the other worked, and treated a full pump as the sign that a muscle had been worked hard enough. It demands lots of food and sleep to recover from.',
  },
  'arnold-split|Shoulders & Arms': {
    brief: 'Presses and raises, then curls and triceps work in supersets. Arm day, Venice style.',
    logistics: 'About 60 minutes. Press heavy first, then do the laterals. Superset biceps with triceps (curls with close-grip bench, incline curls with lying extensions) and finish with wrist curls. Keep rests to about a minute.',
    philosophy: 'Arnold’s "shocking principle": keep changing angles and techniques so the muscles never settle in. Arms were his showpiece, and he trained them with the same intensity as legs.',
  },
  'arnold-split|Legs': {
    brief: 'Squats, then quad and hamstring work, then ten sets of calves. Long and hard.',
    logistics: 'About 75 minutes. Squat first and heaviest, then extensions and curls. Calves get 10 sets with a full stretch, a full squeeze and short rests. Finish with hanging leg raises.',
    philosophy: 'Arnold famously cut the legs off his sweatpants so he couldn’t hide his weak calves from himself. Attack your weak points first and hardest; this is the day a lot of physiques are won.',
  },
  'gironda-8x8|Chest, Back & Shoulders': {
    brief: '8×8 on the neck press, wide chins and laterals, with moderate weight and only 15–30 seconds’ rest.',
    logistics: 'About 30–40 minutes. Pick a weight around 60% of what you’d use for a normal set of 8, and use a timer: 15–30 seconds between sets, no more. Take the neck press light and with a spotter, lowering the bar slowly to the base of your neck.',
    philosophy: 'Vince Gironda called 8×8 the "honest workout": the short rests make a moderate weight brutally hard and build muscle density. He chose exercises to sculpt shape (the neck press for the upper, outer chest) rather than simply to add size.',
  },
  'gironda-8x8|Arms': {
    brief: 'Preacher curls and pressdowns, 8×8 each, with short rests and constant tension.',
    logistics: 'About 25 minutes. Use a weight you could normally curl 12–14 times, and hold rests to 15–30 seconds. Keep strict form on the preacher bench, with no bouncing out of the bottom.',
    philosophy: 'Gironda trained arms for shape, especially the lower biceps, using the preacher curl Larry Scott made famous. The density method floods the muscle with blood and keeps tension high without needing heavy weights.',
  },
  'gironda-8x8|Legs': {
    brief: 'Hack squats, leg curls and calves, 8×8 each, with short rests.',
    logistics: 'About 35 minutes. Hack squat with a moderate weight and your feet low on the platform. Stick to the 15–30 second rests; the last sets of each exercise will be very hard. Use a full range of motion on every calf rep.',
    philosophy: 'Gironda wasn’t a fan of heavy back squats for everyone; he preferred hack and sissy squats to build the quads without thickening the hips. Shape and density over sheer size.',
  },
};

/* ---------- 6-week training cycles ---------- */
const TRAIN_GOALS = [
  { id: 'size', name: 'Build size', desc: 'Add muscle mass all over.' },
  { id: 'strength', name: 'Get stronger', desc: 'Move more weight on the big lifts.' },
  { id: 'shape', name: 'Shape & proportion', desc: 'Classic lines: symmetry, detail and weak points.' },
  { id: 'brief', name: 'Short & efficient', desc: 'Brief workouts with plenty of recovery.' },
  { id: 'foundation', name: 'All-round foundation', desc: 'Solid basics, conditioning and good habits.' },
];
/* How well each program fits each goal (0-3), plus why. */
const PROGRAM_FIT = {
  'heavy-duty': { size: 3, strength: 1, shape: 1, brief: 3, foundation: 1, level: 2, why: { size: 'All-out intensity with full recovery, the Mentzer way to grow.', brief: 'Three short sessions spread over two weeks.' } },
  'consolidation': { size: 1, strength: 3, shape: 0, brief: 3, foundation: 0, level: 3, why: { strength: 'Big compound lifts only, with long recovery to keep getting stronger.', brief: 'Two movements a session: the bare minimum that works.' } },
  'colorado': { size: 2, strength: 1, shape: 1, brief: 2, foundation: 3, level: 1, why: { foundation: 'Brief full-body circuits that build strength and conditioning together.', size: 'Fast full-body HIT, in the spirit of the Colorado Experiment.' } },
  'golden-six': { size: 2, strength: 2, shape: 1, brief: 1, foundation: 3, level: 1, why: { foundation: 'The six classic basics: the base every golden-era champion built on.', size: 'Full-body basics done often build a solid base of muscle.' } },
  'park-5x5': { size: 2, strength: 3, shape: 0, brief: 1, foundation: 2, level: 1, why: { strength: 'Heavy 5×5 on the big lifts: Reg Park’s strength base.', foundation: 'Simple heavy basics that build real strength.' } },
  'arnold-split': { size: 3, strength: 1, shape: 2, brief: 0, foundation: 0, level: 3, why: { size: 'Venice Beach volume for maximum pump and mass.', shape: 'Volume and variety to bring up every body part.' } },
  'gironda-8x8': { size: 2, strength: 0, shape: 3, brief: 1, foundation: 1, level: 2, why: { shape: 'Gironda’s density training and exercise choice sculpt shape and detail.', size: '8×8 density work builds muscle without heavy loads.' } },
};
/* Sessions that make up one cycle-week (a week ends when you finish them, like Ladder). */
const CYCLE_PER_WEEK = { 'heavy-duty': 2, 'consolidation': 1, 'colorado': 3, 'golden-six': 3, 'park-5x5': 3, 'arnold-split': 6, 'gironda-8x8': 3 };
const CYCLE_WEEKS = 6;
const PHASE_NAMES = ['Groove', 'Build', 'Build', 'Push', 'Peak', 'Deload'];
/* Per training style: what each week asks of you, and how working sets change ('half' = halve them). */
const PHASES = {
  HIT: { sets: [0, 0, 0, 0, 0, 0], text: [
    'Set your weights and dial in form. Stop each set 1–2 reps short of failure.',
    'Every working set to true failure. Beat the logbook.',
    'Every working set to true failure. Beat the logbook again.',
    'After reaching failure, add 2–3 forced reps, or finish with one slow 8-second negative.',
    'Rest-pause: after failure, rest 10–15 seconds, then squeeze out 1–2 more reps.',
    'Deload: one set per exercise, stopping 2 reps short of failure. Test one key lift with a single all-out set.'] },
  Volume: { sets: [-1, 0, 1, 1, 1, 'half'], text: [
    'One set fewer than normal. Find your weights and groove each movement.',
    'Full program volume. Chase the pump with controlled reps.',
    'One extra set on each exercise. Keep rests honest.',
    'Extra set, and make the last set of each exercise a drop set.',
    'Shocking week: extra set, supersets and drop sets where they fit. The hardest week of the cycle.',
    'Deload: half the sets at a comfortable weight. Let everything recover.'] },
  Strength: { sets: [0, 0, 0, 0, 0, 'half'], text: [
    'Start at about 90% of your last bests. Fast, clean reps.',
    'Add weight every session you complete all your reps.',
    'Keep adding weight. Rest the full 2–3 minutes.',
    'Bigger jumps where the bar moved fast last time. Rest up to 4 minutes.',
    'Peak: after your 5×5, work up to one heavy triple on the first lift.',
    'Deload: half the sets at about 80%. Test one lift with a heavy set of 3.'] },
  Classic: { sets: [-1, 0, 0, 1, 1, 'half'], text: [
    'One set fewer than normal. Set your weights with clean reps.',
    'Full sets. Add weight once every set hits the target reps.',
    'Full sets. Push for an extra rep on each.',
    'One extra set per exercise.',
    'Extra set, and take the last set of each exercise close to failure.',
    'Deload: half the sets at a comfortable weight.'] },
  Density: { sets: [0, 0, 0, 0, 0, 'half'], text: [
    '8×8 with 30 seconds’ rest. Find a weight you can complete all 64 reps with.',
    '8×8 with 25–30 seconds’ rest. Add weight if you finish every rep.',
    '8×8 with 25 seconds’ rest.',
    '8×8 with only 20 seconds’ rest.',
    '8×8 with 15 seconds’ rest: Gironda’s "honest workout" at its most honest.',
    'Deload: 4×8 with 30 seconds’ rest at a comfortable weight.'] },
};
/* Lifts that define their programs and never rotate. */
const CORE_LIFTS = new Set(['Squat', 'Deadlift', 'Bench Press', 'Overhead Press']);
/* Hand-picked variations for cycle rotation: same job, similar loading (not equipment fallbacks). */
const ROTATE = {
  'Pec Deck': ['DB Flyes', 'Cable Crossover'], 'DB Flyes': ['Cable Crossover', 'Pec Deck'], 'Cable Crossover': ['DB Flyes', 'Pec Deck'],
  'Incline Press': ['Incline DB Press'], 'Wide-Grip Bench Press': ['DB Bench Press'],
  'Nautilus Pullover': ['Straight-Arm Pulldown', 'DB Pullover'], 'DB Pullover': ['Straight-Arm Pulldown'],
  'Close-Grip Palms-Up Pulldown': ['Chin-Up'], 'Chin-Up': ['Close-Grip Palms-Up Pulldown'],
  'Wide-Grip Chin-Up': ['Wide-Grip Pulldown'], 'Wide-Grip Pulldown': ['Wide-Grip Chin-Up'],
  'Barbell Row': ['One-Arm DB Row'],
  'Leg Press': ['Hack Squat'], 'Hack Squat': ['Leg Press'], 'Front Squat': ['Hack Squat'], 'Leg Extension': ['Sissy Squat'],
  'Stiff-Leg Deadlift': ['DB Romanian Deadlift'],
  'Behind-the-Neck Press': ['Seated DB Press'], 'Seated DB Press': ['Behind-the-Neck Press'],
  'DB Lateral Raise': ['Cable Lateral Raise'], 'Cable Lateral Raise': ['DB Lateral Raise'],
  'Bent-Over Lateral Raise': ['Reverse Pec Deck'], 'Reverse Pec Deck': ['Bent-Over Lateral Raise'],
  'Barbell Curl': ['DB Curl'], 'Incline DB Curl': ['Concentration Curl'], 'Preacher Curl': ['Concentration Curl'],
  'Triceps Pressdown': ['Lying Triceps Extension', 'Overhead DB Extension'], 'Lying Triceps Extension': ['Overhead DB Extension'],
  'Hanging Leg Raise': ['Lying Leg Raise'], 'Bent-Knee Sit-Up': ['Lying Leg Raise'], 'Wrist Curl': ['DB Wrist Curl'],
};

/* ---------- Guided warm-up (Ladder-style timed block at the start of a workout) ----------
   [name, seconds]; picked by the muscle groups a workout trains. */
const WARMUP_MOVES = {
  general: [['Light cardio (bike, rower or brisk walk)', 120], ['Jumping jacks', 30]],
  Chest: [['Arm circles, forward', 20], ['Arm circles, backward', 20], ['Doorway chest stretch', 30], ['Scap push-ups', 30]],
  Back: [['Lat stretch, hands on wall \u2022 left', 20], ['Lat stretch, hands on wall \u2022 right', 20], ['Cat\u2013cow', 30], ['Dead hang', 20]],
  Shoulders: [['Arm circles, forward', 20], ['Arm circles, backward', 20], ['Band pull-aparts (or reverse flyes, no weight)', 30], ['Wall slides', 30]],
  Arms: [['Wrist circles', 20], ['Light band or bodyweight curls', 30], ['Triceps stretch \u2022 each arm', 30]],
  Legs: [['Leg swings, front to back \u2022 left', 20], ['Leg swings, front to back \u2022 right', 20], ['Hip circles', 20], ['Bodyweight squats', 30], ['Ankle rocks', 20]],
  Abs: [['Cat\u2013cow', 30], ['Dead bug', 30]],
};

/* ---------- Cable machine exercises ---------- */
Object.assign(EXERCISES, {
  'Seated Cable Row': ['Back', ['cable'], ['Barbell Row', 'One-Arm DB Row'],
    ['Sit tall, knees soft, chest up.', 'Pull the handle to your lower ribs, squeezing your shoulder blades together.', 'Let the weight pull your shoulders forward into a full stretch, without rounding your lower back.'], ''],
  'Single-Arm Cable Row': ['Back', ['cable'], ['One-Arm DB Row', 'Seated Cable Row'],
    ['One handle, braced against the bench or your knee.', 'Row toward your hip, elbow close to your side.', 'Reach forward into a full lat stretch on the way back.'], ''],
  'Neutral-Grip Pulldown': ['Back', ['cable'], ['Close-Grip Palms-Up Pulldown', 'Chin-Up'],
    ['V-bar or neutral handles, thighs under the pad.', 'Pull to your upper chest, elbows driving down to your sides.', 'Slow return to a full stretch overhead.'], ''],
  'Cable Shrug': ['Back', ['cable'], [],
    ['Low pulley, straight bar, arms straight.', 'Shrug your shoulders straight up toward your ears.', 'Hold a second at the top, then lower all the way.'], ''],
  'Low-to-High Cable Fly': ['Chest', ['cable'], ['Incline DB Press', 'Cable Crossover'],
    ['Pulleys set low, slight forward lean.', 'Sweep your hands up and together to about chin height.', 'Squeeze the upper chest, then lower slowly.'], ''],
  'Face Pull': ['Shoulders', ['cable'], ['Cable Rear Delt Fly', 'Bent-Over Lateral Raise'],
    ['Rope at upper-chest to face height.', 'Pull toward your face, elbows high and wide, hands finishing beside your ears.', 'Squeeze the rear delts and upper back, then return slowly.'], ''],
  'Cable Rear Delt Fly': ['Shoulders', ['cable'], ['Reverse Pec Deck', 'Bent-Over Lateral Raise'],
    ['Cross the cables: left hand holds the right cable, and vice versa.', 'Sweep your arms out wide at shoulder height.', 'Lead with the elbows and squeeze the rear delts.'], ''],
  'Cable Front Raise': ['Shoulders', ['cable'], ['DB Lateral Raise'],
    ['Low pulley behind you, handle or bar in front of your thighs.', 'Raise straight up to shoulder height with a slight elbow bend.', 'Lower slowly against the cable.'], ''],
  'Cable Upright Row': ['Shoulders', ['cable'], ['Cable Lateral Raise', 'DB Lateral Raise'],
    ['Low pulley, straight bar, hands about shoulder-width.', 'Pull up along your body, elbows leading, to mid-chest.', 'Stop before your shoulders pinch; lower under control.'], ''],
  'Cable Curl': ['Arms', ['cable'], ['Barbell Curl', 'DB Curl'],
    ['Low pulley, straight or EZ bar, elbows pinned.', 'Curl to full contraction; the cable keeps tension at the top.', 'Lower slowly to a full stretch.'], 'Arnold cable curl'],
  'Cable Hammer Curl': ['Arms', ['cable'], ['DB Curl', 'Cable Curl'],
    ['Low pulley with a rope, palms facing each other.', 'Curl up, keeping your elbows at your sides.', 'Squeeze, then lower slowly.'], ''],
  'Rope Pushdown': ['Arms', ['cable'], ['Triceps Pressdown', 'Overhead DB Extension'],
    ['High pulley with a rope, elbows pinned to your sides.', 'Push down and spread the rope apart at the bottom.', 'Return until your forearms are just past parallel.'], ''],
  'Overhead Cable Extension': ['Arms', ['cable'], ['Overhead DB Extension', 'Lying Triceps Extension'],
    ['Face away from the pulley, rope behind your head, elbows up.', 'Extend your arms forward and up to lockout.', 'Return slowly for a deep triceps stretch.'], ''],
  'Cable Triceps Kickback': ['Arms', ['cable'], ['Rope Pushdown', 'Overhead DB Extension'],
    ['Hinge forward, upper arm parallel to the floor.', 'Extend the elbow straight back to lockout.', 'Keep the upper arm still; lower slowly.'], ''],
  'Cable Pull-Through': ['Legs', ['cable'], ['Stiff-Leg Deadlift', 'DB Romanian Deadlift'],
    ['Face away from a low pulley, rope between your legs.', 'Hinge back at the hips with a flat back.', 'Drive your hips forward and squeeze your glutes to stand.'], ''],
  'Cable Glute Kickback': ['Legs', ['cable'], ['Cable Pull-Through'],
    ['Ankle strap on a low pulley, hold the frame for balance.', 'Kick the leg straight back, squeezing the glute.', 'Control it back to the start. All reps, then switch legs.'], ''],
  'Cable Crunch': ['Abs', ['cable'], ['Bent-Knee Sit-Up', 'Hanging Leg Raise'],
    ['Kneel facing a high pulley, rope beside your head.', 'Crunch your ribs toward your hips, rounding your spine.', 'Keep your hips still; return slowly.'], ''],
  'Cable Woodchop': ['Abs', ['cable'], ['Cable Crunch'],
    ['Stand side-on to the pulley, arms long.', 'Rotate through your torso, pulling the handle across your body.', 'Control it back. All reps, then switch sides.'], ''],
});
/* Cable options as alternatives for existing exercises (equipment swaps, Swap for). */
[['Barbell Row', 'Seated Cable Row'], ['One-Arm DB Row', 'Single-Arm Cable Row'], ['Close-Grip Palms-Up Pulldown', 'Neutral-Grip Pulldown'],
 ['Barbell Curl', 'Cable Curl'], ['DB Curl', 'Cable Curl'], ['Incline DB Curl', 'Cable Curl'], ['Triceps Pressdown', 'Rope Pushdown'],
 ['Lying Triceps Extension', 'Overhead Cable Extension'], ['Overhead DB Extension', 'Overhead Cable Extension'],
 ['Bent-Over Lateral Raise', 'Cable Rear Delt Fly'], ['Reverse Pec Deck', 'Face Pull'], ['DB Lateral Raise', 'Cable Upright Row'],
 ['Incline DB Press', 'Low-to-High Cable Fly'], ['Stiff-Leg Deadlift', 'Cable Pull-Through'], ['DB Romanian Deadlift', 'Cable Pull-Through'],
 ['Bent-Knee Sit-Up', 'Cable Crunch'], ['Hanging Leg Raise', 'Cable Crunch'], ['Lying Leg Raise', 'Cable Crunch']]
  .forEach(([n, a]) => { if (!EXERCISES[n][2].includes(a)) EXERCISES[n][2].push(a); });
/* What the new cable exercises mainly target (used for suggestions). */
const EXTRA_TARGETS = {
  'Seated Cable Row': 'Upper back', 'Single-Arm Cable Row': 'Upper back', 'Neutral-Grip Pulldown': 'Lats', 'Cable Shrug': 'Traps',
  'Low-to-High Cable Fly': 'Upper chest', 'Face Pull': 'Rear delts', 'Cable Rear Delt Fly': 'Rear delts', 'Cable Front Raise': 'Front delts',
  'Cable Upright Row': 'Side delts', 'Cable Curl': 'Biceps', 'Cable Hammer Curl': 'Biceps', 'Rope Pushdown': 'Triceps',
  'Overhead Cable Extension': 'Triceps', 'Cable Triceps Kickback': 'Triceps', 'Cable Pull-Through': 'Hamstrings', 'Cable Glute Kickback': 'Glutes',
  'Cable Crunch': 'Abs', 'Cable Woodchop': 'Abs',
};
/* Cable variations join cycle rotation. */
Object.assign(ROTATE, {
  'Seated Cable Row': ['Barbell Row', 'Single-Arm Cable Row'], 'Single-Arm Cable Row': ['One-Arm DB Row'],
  'One-Arm DB Row': ['Single-Arm Cable Row'], 'Neutral-Grip Pulldown': ['Close-Grip Palms-Up Pulldown'],
  'Cable Curl': ['Barbell Curl', 'Cable Hammer Curl'], 'DB Curl': ['Cable Curl'], 'Cable Hammer Curl': ['Cable Curl'],
  'Rope Pushdown': ['Triceps Pressdown', 'Overhead Cable Extension'], 'Overhead Cable Extension': ['Overhead DB Extension', 'Rope Pushdown'],
  'Overhead DB Extension': ['Overhead Cable Extension'], 'Face Pull': ['Cable Rear Delt Fly'], 'Cable Rear Delt Fly': ['Face Pull', 'Bent-Over Lateral Raise'],
  'Low-to-High Cable Fly': ['Cable Crossover'], 'Cable Crunch': ['Hanging Leg Raise'],
});
ROTATE['Barbell Row'] = ['One-Arm DB Row', 'Seated Cable Row'];
ROTATE['Barbell Curl'] = ['DB Curl', 'Cable Curl'];
ROTATE['Triceps Pressdown'] = ['Rope Pushdown', 'Lying Triceps Extension', 'Overhead DB Extension'];
ROTATE['Close-Grip Palms-Up Pulldown'] = ['Chin-Up', 'Neutral-Grip Pulldown'];
ROTATE['Bent-Over Lateral Raise'] = ['Reverse Pec Deck', 'Cable Rear Delt Fly'];
ROTATE['Hanging Leg Raise'] = ['Lying Leg Raise', 'Cable Crunch'];
Object.assign(EX_DEMO, {
  "Seated Cable Row": "fUBheHs",
  "Single-Arm Cable Row": "vpp9Ku2",
  "Face Pull": "wqNPGCg",
  "Cable Rear Delt Fly": "aqvSOQE",
  "Cable Front Raise": "u2X71Np",
  "Cable Upright Row": "cALKspW",
  "Cable Curl": "G08RZcQ",
  "Cable Hammer Curl": "HPlPoQA",
  "Rope Pushdown": "dU605di",
  "Overhead Cable Extension": "2IxROQ1",
  "Low-to-High Cable Fly": "FVmZVhk",
  "Cable Crunch": "WW95auq",
  "Cable Pull-Through": "OM46QHm",
  "Cable Woodchop": "aVs3BR3",
  "Cable Shrug": "Eg98Ft9",
  "Neutral-Grip Pulldown": "4c9BhzB",
  "Cable Triceps Kickback": "vvNjDJS",
  "Cable Glute Kickback": "Kpajagk",
});
/* Cable variations first in these pairs so they rotate in from the next cycle. */
Object.assign(ROTATE, {
  'Barbell Row': ['Seated Cable Row', 'One-Arm DB Row'], 'Barbell Curl': ['Cable Curl', 'DB Curl'], 'Incline DB Curl': ['Cable Curl', 'Concentration Curl'],
  'Lying Triceps Extension': ['Overhead Cable Extension', 'Overhead DB Extension'], 'Hanging Leg Raise': ['Cable Crunch', 'Lying Leg Raise'],
  'Bent-Knee Sit-Up': ['Cable Crunch', 'Lying Leg Raise'], 'Stiff-Leg Deadlift': ['DB Romanian Deadlift', 'Cable Pull-Through'],
});

/* ---------- Unilateral (single-arm) triceps ---------- */
Object.assign(EXERCISES, {
  'Single-Arm Cable Pushdown': ['Arms', ['cable'], ['Rope Pushdown', 'Single-Arm DB Kickback'],
    ['High pulley with a single handle, elbow pinned to your side.', 'Push down to full lockout and squeeze; try an underhand grip for variety.', 'Return slowly until the forearm is just past parallel. All reps, then switch arms.'], ''],
  'Single-Arm Cable Extension': ['Arms', ['cable'], ['Single-Arm Cable Pushdown', 'Overhead Cable Extension'],
    ['Stand beside a high pulley, handle in the far hand.', 'Extend the arm down and across your body, keeping the upper arm still.', 'Control the return for a full stretch. All reps, then switch arms.'], ''],
  'Single-Arm Overhead DB Extension': ['Arms', ['dumbbell', 'bench'], ['Overhead DB Extension', 'Overhead Cable Extension'],
    ['Sit tall, one dumbbell overhead, elbow pointing up.', 'Lower it behind your head, keeping the elbow close to your head.', 'Extend to lockout. Use your free hand to steady the elbow. Then switch arms.'], ''],
  'Single-Arm DB Kickback': ['Arms', ['dumbbell', 'bench'], ['Cable Triceps Kickback', 'Single-Arm Cable Pushdown'],
    ['Knee and hand on a bench, upper arm parallel to the floor.', 'Extend the elbow straight back to lockout and squeeze.', 'Keep the upper arm still; lower slowly. All reps, then switch arms.'], ''],
  'Single-Arm Lying DB Extension': ['Arms', ['dumbbell', 'bench'], ['Lying Triceps Extension', 'Single-Arm Overhead DB Extension'],
    ['Lie on a bench, one dumbbell held straight up.', 'Lower it across your face toward the opposite shoulder, bending only at the elbow.', 'Extend back up. All reps, then switch arms.'], ''],
});
Object.assign(EX_DEMO, { 'Single-Arm Cable Pushdown': 'qRZ5S1N', 'Single-Arm Cable Extension': 'sYCcnon', 'Single-Arm Overhead DB Extension': 'nAuHPcD', 'Single-Arm DB Kickback': 'W6PxUkg', 'Single-Arm Lying DB Extension': 'wyaqzOS' });
Object.assign(EXTRA_TARGETS, { 'Single-Arm Cable Pushdown': 'Triceps', 'Single-Arm Cable Extension': 'Triceps', 'Single-Arm Overhead DB Extension': 'Triceps', 'Single-Arm DB Kickback': 'Triceps', 'Single-Arm Lying DB Extension': 'Triceps' });
[['Triceps Pressdown', 'Single-Arm Cable Pushdown'], ['Rope Pushdown', 'Single-Arm Cable Pushdown'], ['Overhead DB Extension', 'Single-Arm Overhead DB Extension'],
 ['Overhead Cable Extension', 'Single-Arm Cable Extension'], ['Lying Triceps Extension', 'Single-Arm Lying DB Extension'], ['Cable Triceps Kickback', 'Single-Arm DB Kickback'],
 ['Bench Dips', 'Single-Arm DB Kickback']]
  .forEach(([n, a]) => { if (!EXERCISES[n][2].includes(a)) EXERCISES[n][2].push(a); });
Object.assign(ROTATE, {
  'Triceps Pressdown': ['Rope Pushdown', 'Single-Arm Cable Pushdown', 'Lying Triceps Extension'],
  'Rope Pushdown': ['Triceps Pressdown', 'Single-Arm Cable Pushdown', 'Overhead Cable Extension'],
  'Overhead DB Extension': ['Single-Arm Overhead DB Extension', 'Overhead Cable Extension'],
  'Lying Triceps Extension': ['Overhead Cable Extension', 'Single-Arm Lying DB Extension', 'Overhead DB Extension'],
  'Single-Arm Cable Pushdown': ['Single-Arm DB Kickback', 'Rope Pushdown'], 'Single-Arm DB Kickback': ['Single-Arm Cable Pushdown'],
  'Single-Arm Overhead DB Extension': ['Overhead DB Extension'], 'Single-Arm Lying DB Extension': ['Lying Triceps Extension'],
  'Single-Arm Cable Extension': ['Single-Arm Cable Pushdown'],
});

/* ---------- Second ("B") sessions for programs that repeat a day within a week ----------
   Arnold trained each body part twice a week with different angles and tools. */
const DAY_B = {
  'arnold-split|Chest & Back': [
    { name: 'Incline DB Press', sets: 5, reps: '6-10' },
    { name: 'Dips', sets: 4, reps: '8-12' },
    { name: 'Cable Crossover', sets: 4, reps: '10-12' },
    { name: 'Wide-Grip Pulldown', sets: 5, reps: '8-10' },
    { name: 'Seated Cable Row', sets: 5, reps: '8-10' },
    { name: 'Straight-Arm Pulldown', sets: 3, reps: '12-15' },
  ],
  'arnold-split|Shoulders & Arms': [
    { name: 'Seated DB Press', sets: 5, reps: '8-10', note: 'Arnold press: rotate palms from facing you to facing forward' },
    { name: 'Cable Lateral Raise', sets: 4, reps: '10-12' },
    { name: 'Bent-Over Lateral Raise', sets: 4, reps: '10-12' },
    { name: 'Preacher Curl', sets: 4, reps: '8-10', ss: true },
    { name: 'Overhead Cable Extension', sets: 4, reps: '10-12' },
    { name: 'Concentration Curl', sets: 3, reps: '10-12', ss: true },
    { name: 'Single-Arm DB Kickback', sets: 3, reps: '10-12' },
    { name: 'DB Wrist Curl', sets: 3, reps: '12-15' },
  ],
  'arnold-split|Legs': [
    { name: 'Front Squat', sets: 5, reps: '8-10' },
    { name: 'Leg Press', sets: 4, reps: '12-15' },
    { name: 'Leg Curl', sets: 5, reps: '10-12' },
    { name: 'DB Romanian Deadlift', sets: 4, reps: '10' },
    { name: 'Single-Leg DB Calf Raise', sets: 6, reps: '12-15' },
    { name: 'Cable Crunch', sets: 4, reps: '12-15' },
  ],
};
Object.assign(DAY_NOTES, {
  'arnold-split|Chest & Back B': {
    brief: 'Second chest and back day: new angles and the cables. Incline dumbbells, dips and crossovers, then pulldowns, cable rows and straight-arm work.',
    logistics: 'About 60 minutes. Pair a push with a pull again (incline DB press with pulldowns, dips with cable rows) and keep rests around a minute. Dumbbells and cables let you go deeper and squeeze harder than the barbell day, so use slightly lighter weights and chase the stretch and contraction.',
    philosophy: 'Arnold hit each muscle twice a week and rarely the same way twice. The A day builds with heavy barbells; the B day shapes and pumps from different angles, so the muscle never fully adapts. Variety in angle, not just more sets, is what fills out a physique.',
  },
  'arnold-split|Shoulders & Arms B': {
    brief: 'Arnold presses, cable and rear-delt work, then preacher and concentration curls paired with overhead and single-arm triceps.',
    logistics: 'About 60 minutes. Start with the Arnold press, rotating your palms as you press. Superset the arm work as marked: preacher curls with overhead cable extensions, concentration curls with single-arm kickbacks. Rest about a minute between rounds and finish with wrist curls.',
    philosophy: 'The A day loads the arms heavy; the B day isolates for peak and detail. Arnold used concentration curls and one-arm work to build the biceps peak, and believed every angle had to be trained to build complete arms.',
  },
  'arnold-split|Legs B': {
    brief: 'Front squats, high-rep leg press, leg curls and Romanian deadlifts, then single-leg calves and cable crunches.',
    logistics: 'About 60–70 minutes. Front squat first while you’re fresh, then go for a burn on the high-rep leg press. Hamstrings get two movements. Do calves one leg at a time with a full stretch and a hard squeeze, and finish with cable crunches.',
    philosophy: 'Heavy back squats on the A day build the base; the B day changes the angle and the rep range to bring up the quad sweep, hamstrings and calves. Arnold attacked his calves relentlessly until they matched the rest of him.',
  },
});
