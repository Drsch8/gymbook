// Bodyweight training programs

export interface FogDay {
  day: number
  focus: string
  method: string
  exercises: string[]
}

export interface FogBlock {
  weekLabel: string
  weeks: number[]
  phase: string
  sessionsPerWeek: number
  days: FogDay[]
}

export interface FogWechselWeek {
  week: number
  days: FogDay[]
}

export interface FogRequirement {
  category: string
  text: string
}

export interface FogProgram {
  id: string
  name: string
  subtitle: string
  requirements: FogRequirement[]
  blocks: FogBlock[]
  wechsel: FogWechselWeek[]
  totalSessions: number
}

export interface FogFlatSession {
  index: number
  week: number
  day: number
  focus: string
  method: string
  phase: string
  sessionsPerWeek: number
  exercises: string[]
}

export function flattenFogProgram(p: FogProgram): FogFlatSession[] {
  const sessions: FogFlatSession[] = []
  for (const block of p.blocks) {
    for (const week of block.weeks) {
      for (const d of block.days) {
        sessions.push({
          index: sessions.length,
          week,
          day: d.day,
          focus: d.focus,
          method: d.method,
          phase: block.phase,
          sessionsPerWeek: block.sessionsPerWeek,
          exercises: d.exercises,
        })
      }
    }
  }
  for (const ww of p.wechsel) {
    for (const d of ww.days) {
      sessions.push({
        index: sessions.length,
        week: ww.week,
        day: d.day,
        focus: d.focus,
        method: d.method,
        phase: 'Alternating Block',
        sessionsPerWeek: 5,
        exercises: d.exercises,
      })
    }
  }
  return sessions
}

// ── Training method descriptions ─────────────────────────────────────────────

export const TRAINING_METHODS = [
  {
    name: 'Step Interval',
    shortName: 'Step Intervals',
    description:
      'Step Intervals use ascending sets: start with 1 rep, rest briefly, then 2, then 3 — and so on until you reach your limit.\n\n' +
      'The rest between steps always equals the duration of the previous set. If 3 reps took 10 seconds, rest 10 seconds.\n\n' +
      'Once you hit your maximum, work back down step by step. Goal: find the step that takes you right to the edge — without complete failure. The descent trains muscular endurance.\n\n' +
      '7.5 minutes per exercise. The timer counts down from that point.',
  },
  {
    name: 'Interval Set',
    shortName: 'Interval Sets',
    description:
      'Three sets on a fixed 3-minute clock: Set 1 starts at minute 0, Set 2 at minute 3, Set 3 at minute 6. The time remaining is your rest — the longer the set takes, the shorter the rest.\n\n' +
      'Target range: 6–12 reps per set, to near-failure. Choose a difficulty level that brings you to your limit within that range.\n\n' +
      'If you hit 12 reps in all three sets, it was too easy — go harder next time.',
  },
  {
    name: 'Superset',
    shortName: 'Supersets',
    description:
      'Two exercises alternated — 4 minutes per exercise, two complete rounds. Order: Exercise A → Exercise B → Exercise A → Exercise B.\n\n' +
      'Exercise A is the heavy compound movement (1–5 reps); Exercise B is the lighter accessory (6–12 reps).\n\n' +
      'Alternating allows partial recovery so Exercise A gets more strength, and you get more total volume in less time.',
  },
  {
    name: 'Circuit',
    shortName: 'Circuits',
    description:
      'All exercises done back-to-back with no fixed rest. After the last exercise, immediately start over. Complete as many rounds as possible in 20 minutes.\n\n' +
      'Rest only when truly at your limit, and keep it as short as possible. Heart rate stays consistently high.\n\n' +
      'Your round count is the benchmark — beat it next time.',
  },
  {
    name: 'High Intensity Set',
    shortName: 'High Intensity Sets',
    description:
      '8 rounds of 20 seconds work, 10 seconds rest — 4 minutes per exercise. The timer advances automatically.\n\n' +
      'Start at about 80% of your maximum speed and hold that pace through all 8 rounds. Consistency is the goal — no all-out sprint in round 1 followed by a crash.\n\n' +
      'The afterburn effect from this format is particularly high — metabolism stays elevated long after the session ends.',
  },
]

// ── Einsteigerprogramm ────────────────────────────────────────────────────────

const BEGINNER: FogProgram = {
  id: 'beginner',
  name: 'Beginner Program',
  subtitle: 'For beginners',
  requirements: [],
  blocks: [
    {
      weekLabel: 'Weeks 1–2',
      weeks: [1, 2],
      phase: 'Muscular Endurance',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1,
          focus: 'Push/Pull',
          method: 'Step Intervals',
          exercises: [
            'Push-Up (hands elevated)',
            'Door Row',
            'Tricep Dip with chair (feet on floor)',
            'Inverted Row mit bent knees',
          ],
        },
        {
          day: 2,
          focus: 'Legs/Core',
          method: 'Step Intervals',
          exercises: [
            'Alternating Reverse Lunge',
            'Alternating Single-Leg Romanian Deadlift',
            'Squat',
            'Swimmer',
          ],
        },
        {
          day: 3,
          focus: 'Push/Pull',
          method: 'Step Intervals',
          exercises: [
            'Push-Up (hands elevated)',
            'Door Row',
            'Tricep Dip with chair (feet on floor)',
            'Inverted Row mit bent knees',
          ],
        },
        {
          day: 4,
          focus: 'Legs/Core',
          method: 'Step Intervals',
          exercises: [
            'Side Lunge',
            'Alternating Single-Leg Romanian Deadlift',
            'Squat mit 1–3 Sek. hold at bottom',
            'Oblique Crunch',
          ],
        },
      ],
    },
    {
      weekLabel: 'Weeks 3–4',
      weeks: [3, 4],
      phase: 'Strength',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1,
          focus: 'Push',
          method: 'Interval Sets',
          exercises: [
            'Push-Up',
            'Military Press (hands elevated)',
            'Close-Grip Push-Up (hands elevated)',
            'Tricep Dip with chair',
          ],
        },
        {
          day: 2,
          focus: 'Legs',
          method: 'Interval Sets',
          exercises: [
            'Split Squat',
            'Side Lunge',
            'Squat mit 1–3 Sek. hold at bottom',
            'Single-Leg Romanian Deadlift on Cushion',
          ],
        },
        {
          day: 3,
          focus: 'Pull',
          method: 'Interval Sets',
          exercises: [
            'Door Row',
            'Inverted Row mit bent knees',
            'Door Row (underhand)',
            'Towel Bicep Curl',
          ],
        },
        {
          day: 4,
          focus: 'Core',
          method: 'Interval Sets',
          exercises: [
            'Leg Raise',
            'Prone Back Extension',
            'Russischer Twist',
            'Swimmer',
          ],
        },
      ],
    },
    {
      weekLabel: 'Weeks 5–6',
      weeks: [5, 6],
      phase: 'Power Block',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1,
          focus: 'Push',
          method: 'Supersets',
          exercises: [
            'Push-Up (feet elevated) / Explosive Push-Up',
            'Military Press / Shoulder Rotation',
            'Close-Grip Push-Up / Tricep Dip with chair',
          ],
        },
        {
          day: 2,
          focus: 'Legs',
          method: 'Supersets',
          exercises: [
            'Reverse Lunge (4–6 Sek.) / Jump Squat',
            'Forward Lunge (4–6 Sek.) / Side Lunge',
            'Romanian Deadlift on Cushion / Squat mit 1–3 Sek.',
          ],
        },
        {
          day: 3,
          focus: 'Pull',
          method: 'Supersets',
          exercises: [
            'Door Pull-Up / Door Row',
            'Door Row mit 4–6 Sek. / Towel Bicep Curl',
            'Inverted Row (underhand) / Door Row (underhand)',
          ],
        },
        {
          day: 4,
          focus: 'Core',
          method: 'Supersets',
          exercises: [
            'V-Up / Russischer Twist',
            'Prone Back Extension / Swimmer',
            'Hanging Leg Raise mit bent knees / Leg Raise',
          ],
        },
      ],
    },
  ],
  wechsel: [
    {
      week: 7,
      days: [
        {
          day: 1, focus: 'Push', method: 'Step Intervals',
          exercises: [
            'Military Press (hands elevated)',
            'Push-Up (hands elevated)',
            'Close-Grip Push-Up (hands elevated)',
            'Tricep Dip with chair (bent knees)',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Supersets',
          exercises: [
            'Reverse Lunge (4–6 Sek.) / Jump Squat',
            'Forward Lunge (4–6 Sek.) / Side Lunge',
            'Romanian Deadlift on Cushion (1–3 Sek.) / Jumping in Place',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Interval Sets',
          exercises: [
            'Door Row',
            'Inverted Row mit bent knees',
            'Door Row (underhand)',
            'Towel Bicep Curl',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'High Intensity Sets',
          exercises: ['Russischer Twist', 'Lying Scissors', 'Standing Knee Raise'],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: ['10 Lungee nach hinten im Wechsel', '8 × Door Row', '6 Push-Upe'],
        },
      ],
    },
    {
      week: 8,
      days: [
        {
          day: 1, focus: 'Push', method: 'High Intensity Sets',
          exercises: [
            'Push-Up (hands at chest height)',
            'Push-Up with Forward Lean',
            'Alternating Jump Lunge',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Step Intervals',
          exercises: [
            'Alternating Reverse Lunge',
            'Single-Leg Romanian Deadlift',
            'Squat mit 1–3 Sek.',
            'Good Morning (1–3 Sek.)',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Supersets',
          exercises: [
            'Door Pull-Up / Door Row',
            'Door Row (4–6 Sek.) / Inverted Row',
            'Inverted Row (underhand) / Door Row (underhand)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Interval Sets',
          exercises: ['Leg Raise', 'Prone Back Extension', 'Russischer Twist', 'Swimmer'],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: ['10 Lungee nach hinten im Wechsel', '8 × Door Row', '6 Push-Upe'],
        },
      ],
    },
    {
      week: 9,
      days: [
        {
          day: 1, focus: 'Push', method: 'Interval Sets',
          exercises: ['Push-Up', 'Military Press (hands elevated)', 'Close-Grip Push-Up (hands elevated)'],
        },
        {
          day: 2, focus: 'Legs', method: 'High Intensity Sets',
          exercises: ['High Knees', 'Lunge', 'Good Morning'],
        },
        {
          day: 3, focus: 'Pull', method: 'Step Intervals',
          exercises: [
            'Inverted Row mit bent knees',
            'Door Row',
            'Inverted Row (underhand) mit bent knees',
            'Door Row (underhand)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersets',
          exercises: ['V-Up / Russischer Twist', 'Prone Back Extension / Swimmer', 'Bicycle Crunch / Leg Raise'],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: ['10 Lungee nach hinten im Wechsel', '8 × Door Row', '6 Push-Upe'],
        },
      ],
    },
    {
      week: 10,
      days: [
        {
          day: 1, focus: 'Push', method: 'Supersets',
          exercises: [
            'Push-Up (feet elevated) / Explosive Push-Up',
            'Military Press / Shoulder Rotation',
            'Close-Grip Push-Up / Tricep Dip with chair',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Interval Sets',
          exercises: [
            'Split Squat',
            'Side Lunge',
            'Squat mit 4–6 Sek.',
            'Single-Leg Romanian Deadlift on Cushion',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'High Intensity Sets',
          exercises: ['Door Row (feet behind hands)', 'Star Jump', 'Towel Bicep Curl'],
        },
        {
          day: 4, focus: 'Core', method: 'Step Intervals',
          exercises: [
            'Reverse Crunch',
            'Prone Back Extension (arms out)',
            'Leg Raise',
            'Prone Back Extension (lower body only)',
          ],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: ['10 Lungee nach hinten im Wechsel', '8 × Door Row', '6 Push-Upe'],
        },
      ],
    },
  ],
  totalSessions: 44,
}

// ── Grundprogramm ─────────────────────────────────────────────────────────────

const FIRST: FogProgram = {
  id: 'first',
  name: 'Foundation Program',
  subtitle: 'For the trained',
  requirements: [
    { category: 'Push', text: '10 push-ups, holding 2 sec at the top and bottom' },
    { category: 'Pull', text: '10 inverted rows with legs extended' },
    { category: 'Legs', text: '15 lunges per side, holding 3 sec at the bottom' },
    { category: 'Core', text: '1 minute in the push-up position' },
  ],
  blocks: [
    {
      weekLabel: 'Weeks 1–2',
      weeks: [1, 2],
      phase: 'Muscular Endurance',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Push/Pull', method: 'Step Intervals',
          exercises: ['Push-Up', 'Inverted Row', 'Military Press', 'Door Row'],
        },
        {
          day: 2, focus: 'Legs/Core', method: 'Step Intervals',
          exercises: [
            'Alternating Reverse Lunge (1–3 Sek.)',
            'Alternating Single-Leg Romanian Deadlift',
            'Jump Squat mit 1–3 Sek.',
            'Prone Back Extension (arms out)',
          ],
        },
        {
          day: 3, focus: 'Push/Pull', method: 'Step Intervals',
          exercises: ['Push-Up', 'Inverted Row', 'Military Press', 'Door Row'],
        },
        {
          day: 4, focus: 'Legs/Core', method: 'Step Intervals',
          exercises: [
            'Alternating Side Lunge (1–3 Sek.)',
            'Alternating Single-Leg Romanian Deadlift',
            'Jump Squat mit 1–3 Sek.',
            'Russischer Twist',
          ],
        },
      ],
    },
    {
      weekLabel: 'Weeks 3–4',
      weeks: [3, 4],
      phase: 'Strength',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Push', method: 'Interval Sets',
          exercises: [
            'Push-Up (feet elevated)',
            'Military Press',
            'Close-Grip Push-Up',
            'Tricep Dip (toes on chair)',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Interval Sets',
          exercises: [
            'Split Squat (1–3 Sek.)',
            'Side Lunge (4–6 Sek.)',
            'Jump Squat (4–6 Sek.)',
            'Romanian Deadlift on Cushion',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Interval Sets',
          exercises: ['Door Pull-Up', 'Inverted Row', 'Door Row', 'Towel Bicep Curl'],
        },
        {
          day: 4, focus: 'Core', method: 'Interval Sets',
          exercises: ['Leg Raise (arms crossed)', 'Superman', 'Bicycle Crunch', 'Prone Back Extension (hands under chin)'],
        },
      ],
    },
    {
      weekLabel: 'Weeks 5–6',
      weeks: [5, 6],
      phase: 'Power Block',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Push', method: 'Supersets',
          exercises: [
            'Push-Up (feet elevated, 1–3 Sek.) / Explosive Push-Up',
            'Military Press (feet elevated) / Shoulder Rotation',
            'Close-Grip Push-Up (feet elevated) / Tricep Dip',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Supersets',
          exercises: [
            'Alternating Single-Leg Squat (Stuhl) / Jump Squat (4–6 Sek.)',
            'Side Lunge (4–6 Sek.) / Reverse Lunge (1–3 Sek.)',
            'Romanian Deadlift on Cushion (1–3 Sek.) / Box Jump',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Supersets',
          exercises: [
            'Door Pull-Up / Door Row',
            'Door Row (4–6 Sek.) / Inverted Row',
            'Inverted Row (underhand) (feet elevated) / Door Row (underhand)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersets',
          exercises: [
            'Hanging Leg Raise mit bent knees / Leg Twist mit bent knees',
            'Single-Leg Hip Extension im Wechsel / Superman',
            'V-Up / Russischer Twist',
          ],
        },
      ],
    },
  ],
  wechsel: [
    {
      week: 7,
      days: [
        {
          day: 1, focus: 'Push', method: 'Step Intervals',
          exercises: ['Pike Push-Up', 'Push-Up', 'Close-Grip Push-Up', 'Tricep Dip with chair'],
        },
        {
          day: 2, focus: 'Legs', method: 'Supersets',
          exercises: [
            'Alternating Single-Leg Squat (2 chairs) / Jump Squat (4–6 Sek.)',
            'Side Lunge (4–6 Sek.) / Reverse Lunge (1–3 Sek.)',
            'Romanian Deadlift on Cushion (1–3 Sek.) / Box Jump',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Interval Sets',
          exercises: ['Door Pull-Up', 'Inverted Row', 'Door Row', 'Towel Bicep Curl'],
        },
        {
          day: 4, focus: 'Core', method: 'High Intensity Sets',
          exercises: ['Russischer Twist', 'Crunch with Scissors', 'Squat'],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: ['6 × Inverted Row mit bent knees', '12 seitliche Lungee im Wechsel', '8 Push-Upe'],
        },
      ],
    },
    {
      week: 8,
      days: [
        {
          day: 1, focus: 'Push', method: 'High Intensity Sets',
          exercises: ['Push-Up (hands elevated)', 'Tricep Dip with chair (feet on floor)', 'Squat'],
        },
        {
          day: 2, focus: 'Legs', method: 'Step Intervals',
          exercises: [
            'Alternating Reverse Lunge (1–3 Sek.)',
            'Side Lunge',
            'Jump Squat mit 1–3 Sek.',
            'Alternating Single-Leg Romanian Deadlift',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Supersets',
          exercises: [
            'Door Pull-Up / Door Row',
            'Door Row (4–6 Sek.) / Inverted Row',
            'Inverted Row (underhand) (feet elevated) / Door Row (underhand)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Interval Sets',
          exercises: ['Leg Raise (arms crossed)', 'Superman', 'Bicycle Crunch', 'Prone Back Extension (hands under chin)'],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: ['6 × Inverted Row mit bent knees', '12 seitliche Lungee im Wechsel', '8 Push-Upe'],
        },
      ],
    },
    {
      week: 9,
      days: [
        {
          day: 1, focus: 'Push', method: 'Interval Sets',
          exercises: [
            'Push-Up (feet elevated)',
            'Pike Push-Up (hands elevated)',
            'Close-Grip Push-Up (hands elevated)',
            'Tricep Dip with chair',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'High Intensity Sets',
          exercises: ['Alternating Jump Lunge', 'Side Jump', 'Squat'],
        },
        {
          day: 3, focus: 'Pull', method: 'Step Intervals',
          exercises: [
            'Inverted Row',
            'Door Row',
            'Inverted Row (underhand)',
            'Door Row (underhand)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersets',
          exercises: [
            'Hanging Leg Raise mit bent knees / Leg Twist',
            'Alternating Single-Leg Hip Extension / Superman',
            'V-Up / Russischer Twist',
          ],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: ['6 × Inverted Row mit bent knees', '12 seitliche Lungee im Wechsel', '8 Push-Upe'],
        },
      ],
    },
    {
      week: 10,
      days: [
        {
          day: 1, focus: 'Push', method: 'Supersets',
          exercises: [
            'Push-Up (feet elevated, 1–3 Sek.) / Explosive Push-Up',
            'Military Press (feet elevated) / Shoulder Press',
            'Close-Grip Push-Up (feet elevated) / Tricep Dip with chair',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Interval Sets',
          exercises: [
            'Split Squat (1–3 Sek.)',
            'Side Lunge (4–6 Sek.)',
            'Jump Squat (4–6 Sek.)',
            'Romanian Deadlift on Cushion',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'High Intensity Sets',
          exercises: ['Inverted Row', 'Door Row', 'Squat'],
        },
        {
          day: 4, focus: 'Core', method: 'Step Intervals',
          exercises: ['Bicycle Crunch', 'Prone Back Extension (hands under chin)', 'Wide-Leg Crunch with Scissors', 'Swimmer'],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: ['6 × Inverted Row mit bent knees', '12 seitliche Lungee im Wechsel', '8 Push-Upe'],
        },
      ],
    },
  ],
  totalSessions: 44,
}

// ── Aufbauprogramm ────────────────────────────────────────────────────────────

const MASTER: FogProgram = {
  id: 'master',
  name: 'Intermediate Program',
  subtitle: 'For the advanced',
  requirements: [
    { category: 'Push', text: '16 alternating one-arm push-ups (hand elevated), 8 per side' },
    { category: 'Pull', text: '4 pull-ups, holding 2 sec at top and bottom' },
    { category: 'Legs', text: '24 alternating single-leg squats (brief touch-down allowed), 12 per side' },
    { category: 'Core', text: '3 minutes in the push-up position' },
  ],
  blocks: [
    {
      weekLabel: 'Weeks 1–2',
      weeks: [1, 2],
      phase: 'Muscular Endurance',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Push/Pull', method: 'Step Intervals',
          exercises: [
            'Alternating One-Arm Push-Up (hand elevated)',
            'Door Pull-Up (feet on chair oder jump start)',
            'Military Press (feet elevated)',
            'Inverted Row',
          ],
        },
        {
          day: 2, focus: 'Legs/Core', method: 'Step Intervals',
          exercises: [
            'Alternating Single-Leg Squat (holding chair back)',
            'Reverse Lunge mit 4–6 Sek.',
            'Hip Extension',
            'Superman',
          ],
        },
        {
          day: 3, focus: 'Push/Pull', method: 'Step Intervals',
          exercises: [
            'Alternating One-Arm Push-Up (hand elevated)',
            'Door Pull-Up (feet on chair oder jump start)',
            'Military Press',
            'Door Row',
          ],
        },
        {
          day: 4, focus: 'Legs/Core', method: 'Step Intervals',
          exercises: [
            'Alternating Single-Leg Squat (holding chair back)',
            'Alternating Side Lunge (1–3 Sek.)',
            'Single-Leg Romanian Deadlift on Cushion',
            'Leg Twist mit bent knees',
          ],
        },
      ],
    },
    {
      weekLabel: 'Weeks 3–4',
      weeks: [3, 4],
      phase: 'Strength',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Push', method: 'Interval Sets',
          exercises: ['One-Arm Push-Up (hand elevated)', 'Pike Push-Up', 'Military Press (feet elevated)', 'Tricep Dip'],
        },
        {
          day: 2, focus: 'Legs', method: 'Interval Sets',
          exercises: [
            'Single-Leg Squat (chair back or elevated surface)',
            'Split Squat (4–6 Sek.)',
            'Side Lunge (4–6 Sek.)',
            'Single-Leg Hip Extension',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Interval Sets',
          exercises: [
            'Door Pull-Up',
            'Door Row mit 1–3 Sek. hold',
            'Inverted Row',
            'Inverted Row (underhand)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Interval Sets',
          exercises: [
            'Hanging Leg Raise (parallel zum Boden)',
            'Back Extension',
            'V-Up',
            'Superman',
          ],
        },
      ],
    },
    {
      weekLabel: 'Weeks 5–6',
      weeks: [5, 6],
      phase: 'Power Block',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Push', method: 'Supersets',
          exercises: [
            'One-Arm Push-Up / Explosive Push-Up',
            'Military Press (feet elevated) / Pike Push-Up',
            'Table Tricep Extension / Explosive Push-Up',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Supersets',
          exercises: [
            'Single-Leg Squat / Box Jump',
            'Tiptoe Squat / Alternating Jump Lunge',
            'Drop Push-Up / Side Jump',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Supersets',
          exercises: [
            'Door Pull-Up / Door Row',
            'One-Arm Door Row / Inverted Row (underhand)',
            'Door Row (underhand) (4–6 Sek.) / Towel Bicep Curl',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersets',
          exercises: [
            'Hanging Leg Raise / Bicycle Crunch',
            'Back Extension / Superman',
            'V-Up / Leg Twist mit bent knees',
          ],
        },
      ],
    },
  ],
  wechsel: [
    {
      week: 7,
      days: [
        {
          day: 1, focus: 'Push', method: 'Step Intervals',
          exercises: [
            'One-Arm Push-Up (hands knee-height elevated)',
            'Pike Push-Up',
            'Tricep Dip',
            'Tricep Dip with chair',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Supersets',
          exercises: [
            'Single-Leg Squat / Tiptoe Squat',
            'Box Jump / Alternating Jump Lunge',
            'Drop Push-Up / Side Jump',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Interval Sets',
          exercises: [
            'Door Pull-Up',
            'Door Row (1–3 Sek.)',
            'Inverted Row',
            'Inverted Row (underhand)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'High Intensity Sets',
          exercises: ['Oblique V-Up (4 sets per side)', 'Crunch with Scissors (arms crossed)', 'Squat'],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: [
            '12 alternating Single-Leg Squats (chair) or Box Jumps',
            '6 Pike Push-Upe',
            '8 × Inverted Row',
          ],
        },
      ],
    },
    {
      week: 8,
      days: [
        {
          day: 1, focus: 'Push', method: 'High Intensity Sets',
          exercises: ['Push-Up', 'Explosive Push-Up', 'Squat'],
        },
        {
          day: 2, focus: 'Legs', method: 'Step Intervals',
          exercises: [
            'Single-Leg Squat (with chair)',
            'Tiptoe Squat',
            'Side Lunge (1–3 Sek.)',
            'Hip Extension',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Supersets',
          exercises: [
            'Door Pull-Up / Inverted Row',
            'One-Arm Door Row / Inverted Row (underhand) (feet elevated)',
            'Door Row (underhand) / Towel Bicep Curl',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Interval Sets',
          exercises: ['Hanging Leg Raise', 'Back Extension', 'V-Up', 'Superman'],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: [
            '12 alternating Single-Leg Squats (chair) or Box Jumps',
            '6 Pike Push-Upe',
            '8 × Inverted Row',
          ],
        },
      ],
    },
    {
      week: 9,
      days: [
        {
          day: 1, focus: 'Push', method: 'Interval Sets',
          exercises: [
            'One-Arm Push-Up (hands elevated)',
            'Pike Push-Up',
            'Military Press (feet elevated)',
            'Tricep Dip',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'High Intensity Sets',
          exercises: ['Alternating Jump Lunge', 'Side Jump', 'Squat'],
        },
        {
          day: 3, focus: 'Pull', method: 'Step Intervals',
          exercises: [
            'Door Pull-Up with chair',
            'Inverted Row',
            'Inverted Row (underhand)',
            'Door Row',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersets',
          exercises: [
            'Hanging Leg Raise / Bicycle Crunch',
            'Back Extension / Superman',
            'V-Up / Leg Twist mit bent knees',
          ],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: [
            '12 alternating Single-Leg Squats (chair) or Box Jumps',
            '6 Pike Push-Upe',
            '8 × Inverted Row',
          ],
        },
      ],
    },
    {
      week: 10,
      days: [
        {
          day: 1, focus: 'Push', method: 'Supersets',
          exercises: [
            'One-Arm Push-Up / Explosive Push-Up',
            'Military Press (feet elevated) / Pike Push-Up',
            'Table Tricep Extension / Explosive Push-Up',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Interval Sets',
          exercises: [
            'Single-Leg Squat (chair back)',
            'Split Squat (4–6 Sek.)',
            'Side Lunge (4–6 Sek.)',
            'Single-Leg Hip Extension',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'High Intensity Sets',
          exercises: ['Inverted Row', 'Door Row', 'Squat'],
        },
        {
          day: 4, focus: 'Core', method: 'Step Intervals',
          exercises: [
            'Oblique V-Up mit bent knees',
            'Star Jump',
            'Leg Raise (arms crossed)',
            'Prone Back Extension (hands under chin)',
          ],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: [
            '12 alternating Single-Leg Squats (chair) or Box Jumps',
            '6 Pike Push-Upe',
            '8 × Inverted Row',
          ],
        },
      ],
    },
  ],
  totalSessions: 44,
}

// ── Eliteprogramm ─────────────────────────────────────────────────────────────

const CHIEF: FogProgram = {
  id: 'chief',
  name: 'Elite Program',
  subtitle: 'For athletes',
  requirements: [
    { category: 'Push', text: '16 one-arm push-ups unassisted, 8 per side' },
    { category: 'Pull', text: '12 pull-ups, holding 1 sec at top and bottom' },
    { category: 'Legs', text: '24 alternating single-leg squats, 12 per side' },
    { category: 'Core', text: '5 minutes in the push-up position' },
  ],
  blocks: [
    {
      weekLabel: 'Weeks 1–2',
      weeks: [1, 2],
      phase: 'Muscular Endurance',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Push/Pull', method: 'Step Intervals',
          exercises: [
            'Alternating One-Arm Push-Up (hand elevated)',
            'Door Pull-Up',
            'Pike Push-Up',
            'Inverted Row (feet elevated)',
          ],
        },
        {
          day: 2, focus: 'Legs/Core', method: 'Step Intervals',
          exercises: [
            'Alternating Single-Leg Squat',
            'Alternating Jump Lunge',
            'Alternating Single-Leg Hip Extension',
            'Back Extension',
          ],
        },
        {
          day: 3, focus: 'Push/Pull', method: 'Step Intervals',
          exercises: [
            'Alternating One-Arm Push-Up (hand elevated)',
            'Door Pull-Up',
            'Military Press (feet elevated)',
            'One-Arm Door Row im Wechsel',
          ],
        },
        {
          day: 4, focus: 'Legs/Core', method: 'Step Intervals',
          exercises: ['Alternating Single-Leg Squat', 'Box Jump', 'Tiptoe Squat', 'Leg Twist'],
        },
      ],
    },
    {
      weekLabel: 'Weeks 3–4',
      weeks: [3, 4],
      phase: 'Strength',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Push', method: 'Interval Sets',
          exercises: [
            'One-Arm Push-Up',
            'Handstand Push-Up',
            'Pike Push-Up',
            'Table Tricep Extension (hip-height)',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Interval Sets',
          exercises: [
            'Single-Leg Squat',
            'Split Squat (4–6 Sek.)',
            'Tiptoe Squat',
            'Alternating Jump Lunge',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Interval Sets',
          exercises: [
            'Door Pull-Up (1–3 Sek. hold at top)',
            'One-Arm Door Row',
            'Inverted Row (underhand) (feet elevated)',
            'Door Row (4–6 Sek.)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Interval Sets',
          exercises: [
            'Hanging Leg Raise (bis ganz nach oben)',
            'Back Extension',
            'V-Up (Jackknife)',
            'Superman',
          ],
        },
      ],
    },
    {
      weekLabel: 'Weeks 5–6',
      weeks: [5, 6],
      phase: 'Power Block',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Push', method: 'Supersets',
          exercises: [
            'One-Arm Push-Up (feet elevated) / Explosive Push-Up',
            'Handstand Push-Up (1–3 Sek.) / Pike Push-Up',
            'Table Tricep Extension (hip-height) / Explosive Push-Up',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Supersets',
          exercises: [
            'Alternating Single-Leg Squat (1–3 Sek.) / Box Jump',
            'Tiptoe Squat (1–3 Sek.) / Alternating Jump Lunge',
            'Drop Push-Up / Side Jump',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Supersets',
          exercises: [
            'Door Pull-Up (4–6 Sek.) / Inverted Row (feet elevated)',
            'One-Arm Door Row (1–3 Sek.) / Inverted Row (underhand) (feet elevated)',
            'Pull-Up (to chest) / Door Row (underhand) (4–6 Sek.)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersets',
          exercises: [
            'Hanging Leg Raise (4–6 Sek.) / Langsames Bicycle Crunch',
            'Back Extension / Superman',
            'V-Up (Jackknife) / Leg Twist',
          ],
        },
      ],
    },
  ],
  wechsel: [
    {
      week: 7,
      days: [
        {
          day: 1, focus: 'Push', method: 'Step Intervals',
          exercises: [
            'One-Arm Push-Up',
            'Handstand Push-Up',
            'Pike Push-Up',
            'Tricep Dip (1–3 Sek.)',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Supersets',
          exercises: [
            'Alternating Single-Leg Squat (1–3 Sek.) / Box Jump',
            'Tiptoe Squat (1–3 Sek.) / Alternating Jump Lunge',
            'Drop Push-Up (no hands) / Side Jump',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'Interval Sets',
          exercises: [
            'Door Pull-Up (1–3 Sek.)',
            'One-Arm Door Row',
            'Inverted Row (underhand) (feet elevated)',
            'Door Row (underhand) (4–6 Sek.)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'High Intensity Sets',
          exercises: ['V-Up', 'Oblique V-Up (4 sets, alternating sides)', 'Mountain Climber', 'Squat'],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: [
            '12 alternating Single-Leg Squats (6/side) or 24 Jump Lunges',
            '6 Handstand Push-Upe',
            '8 Door Pull-Ups',
          ],
        },
      ],
    },
    {
      week: 8,
      days: [
        {
          day: 1, focus: 'Push', method: 'High Intensity Sets',
          exercises: ['Push-Up', 'Explosive Push-Up', 'Mountain Climber', 'Burpee'],
        },
        {
          day: 2, focus: 'Legs', method: 'Step Intervals',
          exercises: ['Single-Leg Squat', 'Tiptoe Squat', 'Alternating Jump Lunge', 'Single-Leg Hip Extension'],
        },
        {
          day: 3, focus: 'Pull', method: 'Supersets',
          exercises: [
            'Door Pull-Up (4–6 Sek.) / Inverted Row (feet elevated)',
            'One-Arm Door Row (1–3 Sek.) / Inverted Row (underhand) (feet elevated)',
            'Pull-Up (to chest) / Door Row (underhand) (4–6 Sek.)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Interval Sets',
          exercises: [
            'Hanging Leg Raise (bis ganz nach oben)',
            'Back Extension',
            'V-Up (Jackknife)',
            'Superman',
          ],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: [
            '12 alternating Single-Leg Squats (6/side) or 24 Jump Lunges',
            '6 Handstand Push-Upe',
            '8 Door Pull-Ups',
          ],
        },
      ],
    },
    {
      week: 9,
      days: [
        {
          day: 1, focus: 'Push', method: 'Interval Sets',
          exercises: [
            'One-Arm Push-Up',
            'Handstand Push-Up',
            'Pike Push-Up',
            'Table Tricep Extension (hip-height)',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'High Intensity Sets',
          exercises: ['Alternating Jump Lunge', 'Side Jump', 'Extended Squat', 'Squat'],
        },
        {
          day: 3, focus: 'Pull', method: 'Step Intervals',
          exercises: [
            'Door Pull-Up',
            'Inverted Row',
            'Inverted Row (underhand)',
            'One-Arm Door Row im Wechsel',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersets',
          exercises: [
            'Hanging Leg Raise (4–6 Sek.) / Langsames Bicycle Crunch (24 ×)',
            'Back Extension / Superman',
            'V-Up (Jackknife) / Leg Twist (12 × langsam)',
          ],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: [
            '12 alternating Single-Leg Squats (6/side) or 24 Jump Lunges',
            '6 Handstand Push-Upe',
            '8 Door Pull-Ups',
          ],
        },
      ],
    },
    {
      week: 10,
      days: [
        {
          day: 1, focus: 'Push', method: 'Supersets',
          exercises: [
            'One-Arm Push-Up (feet elevated) / Explosive Push-Up',
            'Handstand Push-Up / Pike Push-Up (mit hold)',
            'Table Tricep Extension (knee-height) / Explosive Push-Up',
          ],
        },
        {
          day: 2, focus: 'Legs', method: 'Interval Sets',
          exercises: [
            'Single-Leg Squat',
            'Split Squat (backpack overhead)',
            'Alternating Jump Lunge',
            'Drop Push-Up',
          ],
        },
        {
          day: 3, focus: 'Pull', method: 'High Intensity Sets',
          exercises: ['Door Pull-Up', 'Inverted Row', 'Door Row', 'Mountain Climber'],
        },
        {
          day: 4, focus: 'Core', method: 'Step Intervals',
          exercises: [
            'V-Up (Jackknife)',
            'Back Extension',
            'Oblique V-Up im Wechsel (Beine gestreckt)',
            'Superman',
          ],
        },
        {
          day: 5, focus: 'Full Body', method: 'Circuits',
          exercises: [
            '12 alternating Single-Leg Squats (6/side) or 24 Jump Lunges',
            '6 Handstand Push-Upe',
            '8 Door Pull-Ups',
          ],
        },
      ],
    },
  ],
  totalSessions: 44,
}

export const FOG_PROGRAMS: FogProgram[] = [BEGINNER, FIRST, MASTER, CHIEF]
