import type { TrackingType } from '../types'

export interface PlanExercise {
  exerciseId: string
  exerciseName: string
  trackingType: TrackingType
  sets: { reps?: number; duration?: number }[]
}

export interface PlanSession {
  index: number       // 0-based, 0–39
  week: number        // 1–10
  day: 'A' | 'B' | 'C' | 'D'
  phase: string
  name: string        // e.g. "Upper Push"
  exercises: PlanExercise[]
}

// ── Exercise helpers ──────────────────────────────────────────────────────────

function rw(id: string, name: string, sets: number, reps: number): PlanExercise {
  return { exerciseId: id, exerciseName: name, trackingType: 'reps_weight', sets: Array(sets).fill({ reps }) }
}
function ro(id: string, name: string, sets: number, reps: number): PlanExercise {
  return { exerciseId: id, exerciseName: name, trackingType: 'reps_only', sets: Array(sets).fill({ reps }) }
}
function tm(id: string, name: string, sets: number, duration: number): PlanExercise {
  return { exerciseId: id, exerciseName: name, trackingType: 'time', sets: Array(sets).fill({ duration }) }
}

// ── Phase session templates ───────────────────────────────────────────────────

// Phase 1 – Foundation (Weeks 1–3)
const P1: Record<'A' | 'B' | 'C' | 'D', PlanExercise[]> = {
  A: [ // Upper Push
    ro('push_up',        'Push-up',          3, 10),
    ro('pike_push_up',   'Pike Push-up',     3,  8),
    ro('diamond_push_up','Diamond Push-up',  3,  8),
    ro('dip',            'Dip',              3,  8),
  ],
  B: [ // Pull & Core
    ro('bodyweight_row', 'Bodyweight Row',   3, 10),
    rw('chin_up',        'Chin-up',          3,  5),
    tm('plank',          'Plank',            3, 30),
    ro('crunch',         'Crunch',           3, 15),
    ro('leg_raise',      'Leg Raise',        3, 10),
  ],
  C: [ // Legs
    rw('squat',          'Squat',            3, 15),
    rw('lunges',         'Lunges',           3, 12),
    ro('glute_bridge',   'Glute Bridge',     3, 15),
    rw('calf_raise',     'Calf Raise',       3, 20),
  ],
  D: [ // Full Body
    ro('push_up',        'Push-up',          3, 12),
    ro('bodyweight_row', 'Bodyweight Row',   3, 10),
    rw('squat',          'Squat',            3, 15),
    tm('plank',          'Plank',            3, 30),
    ro('mountain_climber','Mountain Climber',3, 15),
  ],
}

// Phase 2 – Toning (Weeks 4–6)
const P2: Record<'A' | 'B' | 'C' | 'D', PlanExercise[]> = {
  A: [ // Upper Push
    ro('push_up',        'Push-up',          4, 15),
    ro('diamond_push_up','Diamond Push-up',  4, 12),
    ro('pike_push_up',   'Pike Push-up',     4, 12),
    ro('dip',            'Dip',              4, 10),
  ],
  B: [ // Pull & Core
    rw('chin_up',        'Chin-up',          4,  8),
    ro('bodyweight_row', 'Bodyweight Row',   4, 12),
    ro('hanging_leg_raise','Hanging Leg Raise',4,10),
    rw('russian_twist',  'Russian Twist',    3, 20),
    tm('side_plank',     'Side Plank',       3, 45),
  ],
  C: [ // Legs
    rw('squat',          'Squat',            4, 20),
    rw('bulgarian_split_squat','Bulgarian Split Squat',4,10),
    rw('lunges',         'Lunges',           4, 15),
    ro('jump_squat',     'Jump Squat',       3, 10),
    rw('calf_raise',     'Calf Raise',       4, 15),
  ],
  D: [ // Full Body
    ro('push_up',        'Push-up',          4, 15),
    ro('bodyweight_row', 'Bodyweight Row',   4, 12),
    rw('squat',          'Squat',            4, 20),
    tm('plank',          'Plank',            4, 45),
    ro('mountain_climber','Mountain Climber',3, 20),
  ],
}

// Phase 3 – Mastery (Weeks 7–9)
const P3: Record<'A' | 'B' | 'C' | 'D', PlanExercise[]> = {
  A: [ // Upper Push
    ro('diamond_push_up','Diamond Push-up',  4, 15),
    ro('dip',            'Dip',              4, 12),
    ro('pike_push_up',   'Pike Push-up',     4, 15),
    ro('push_up',        'Push-up',          4, 20),
  ],
  B: [ // Pull & Core
    rw('pull_up',        'Pull-up',          4,  8),
    rw('chin_up',        'Chin-up',          4, 10),
    ro('hanging_leg_raise','Hanging Leg Raise',4,12),
    ro('ab_wheel',       'Ab Wheel Rollout', 3, 10),
    tm('side_plank',     'Side Plank',       3, 60),
  ],
  C: [ // Legs
    rw('bulgarian_split_squat','Bulgarian Split Squat',4,15),
    ro('jump_squat',     'Jump Squat',       4, 15),
    rw('squat',          'Squat',            4, 25),
    ro('glute_bridge',   'Glute Bridge',     4, 20),
    rw('calf_raise',     'Calf Raise',       4, 20),
  ],
  D: [ // Full Body Conditioning
    ro('burpee',         'Burpee',           3, 10),
    rw('pull_up',        'Pull-up',          4,  8),
    ro('push_up',        'Push-up',          4, 20),
    rw('squat',          'Squat',            4, 25),
    tm('plank',          'Plank',            3, 60),
  ],
}

// Phase 4 – Peak (Week 10)
const P4: Record<'A' | 'B' | 'C' | 'D', PlanExercise[]> = {
  A: [ // Max Push
    ro('diamond_push_up','Diamond Push-up',  5, 15),
    ro('dip',            'Dip',              5, 12),
    ro('pike_push_up',   'Pike Push-up',     5, 15),
    ro('push_up',        'Push-up',          5, 20),
  ],
  B: [ // Max Pull & Core
    rw('pull_up',        'Pull-up',          5, 10),
    rw('chin_up',        'Chin-up',          3, 12),
    ro('hanging_leg_raise','Hanging Leg Raise',5,15),
    ro('ab_wheel',       'Ab Wheel Rollout', 4, 12),
    tm('side_plank',     'Side Plank',       4, 60),
  ],
  C: [ // Max Legs
    ro('jump_squat',     'Jump Squat',       5, 15),
    rw('bulgarian_split_squat','Bulgarian Split Squat',5,15),
    rw('squat',          'Squat',            5, 25),
    ro('glute_bridge',   'Glute Bridge',     4, 20),
  ],
  D: [ // Final Full Body
    ro('burpee',         'Burpee',           4, 12),
    rw('pull_up',        'Pull-up',          4, 10),
    ro('diamond_push_up','Diamond Push-up',  4, 15),
    rw('squat',          'Squat',            4, 25),
    tm('plank',          'Plank',            4, 60),
  ],
}

// ── Session names ─────────────────────────────────────────────────────────────

const DAY_NAMES: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: 'Upper Push',
  B: 'Pull & Core',
  C: 'Legs',
  D: 'Full Body',
}

const PHASE_TEMPLATES: { phase: string; weeks: number; template: typeof P1 }[] = [
  { phase: 'Foundation', weeks: 3, template: P1 },
  { phase: 'Toning',     weeks: 3, template: P2 },
  { phase: 'Mastery',    weeks: 3, template: P3 },
  { phase: 'Peak',       weeks: 1, template: P4 },
]

const DAYS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']

// ── Build the full 40-session plan ────────────────────────────────────────────

export const TRAINING_PLAN: PlanSession[] = (() => {
  const sessions: PlanSession[] = []
  let index = 0
  let week = 1

  for (const { phase, weeks, template } of PHASE_TEMPLATES) {
    for (let w = 0; w < weeks; w++) {
      for (const day of DAYS) {
        sessions.push({
          index,
          week,
          day,
          phase,
          name: DAY_NAMES[day],
          exercises: template[day],
        })
        index++
      }
      week++
    }
  }

  return sessions
})()

export const PLAN_TOTAL = TRAINING_PLAN.length // 40
