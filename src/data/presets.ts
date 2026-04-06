import type { TrackingType } from '../types'

export interface PresetSet {
  reps?: number
  weight?: number
  duration?: number
}

export interface PresetExercise {
  exerciseId: string
  exerciseName: string
  trackingType: TrackingType
  sets: PresetSet[]
}

export interface PresetVariant {
  name: string
  exercises: PresetExercise[]
}

export interface Preset {
  title: string
  variants: PresetVariant[]
}

export const PRESETS: Preset[] = [
  {
    title: 'Legs',
    variants: [
      {
        name: 'Strength',
        exercises: [
          { exerciseId: 'squat',             exerciseName: 'Squat',             trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'deadlift',          exerciseName: 'Deadlift',          trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'leg_press',         exerciseName: 'Leg Press',         trackingType: 'reps_weight', sets: [{ reps: 6 }, { reps: 6 }, { reps: 6 }, { reps: 6 }] },
          { exerciseId: 'hip_thrust',        exerciseName: 'Hip Thrust',        trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
        ],
      },
      {
        name: 'Hypertrophy',
        exercises: [
          { exerciseId: 'squat',                 exerciseName: 'Squat',                  trackingType: 'reps_weight', sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }, { reps: 10 }] },
          { exerciseId: 'bulgarian_split_squat', exerciseName: 'Bulgarian Split Squat',  trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'leg_extension',         exerciseName: 'Leg Extension',          trackingType: 'reps_weight', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }] },
          { exerciseId: 'leg_curl',              exerciseName: 'Leg Curl',               trackingType: 'reps_weight', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }] },
          { exerciseId: 'calf_raise',            exerciseName: 'Calf Raise',             trackingType: 'reps_weight', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }, { reps: 15 }] },
        ],
      },
      {
        name: 'Quick',
        exercises: [
          { exerciseId: 'goblet_squat',      exerciseName: 'Goblet Squat',      trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'lunges',            exerciseName: 'Lunges',            trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'leg_press',         exerciseName: 'Leg Press',         trackingType: 'reps_weight', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }] },
          { exerciseId: 'seated_calf_raise', exerciseName: 'Seated Calf Raise', trackingType: 'reps_weight', sets: [{ reps: 20 }, { reps: 20 }, { reps: 20 }] },
        ],
      },
    ],
  },
  {
    title: 'Upper',
    variants: [
      {
        name: 'Compound',
        exercises: [
          { exerciseId: 'bench_press',    exerciseName: 'Bench Press',    trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'bent_over_row',  exerciseName: 'Bent Over Row',  trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'overhead_press', exerciseName: 'Overhead Press', trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'pull_up',        exerciseName: 'Pull-up',        trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
        ],
      },
      {
        name: 'Volume',
        exercises: [
          { exerciseId: 'bench_press',       exerciseName: 'Bench Press',           trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'db_row',            exerciseName: 'Dumbbell Row',          trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'lat_pulldown',      exerciseName: 'Lat Pulldown',          trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'db_shoulder_press', exerciseName: 'Dumbbell Shoulder Press', trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'db_curl',           exerciseName: 'Dumbbell Curl',         trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'tricep_pushdown',   exerciseName: 'Tricep Pushdown',       trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
        ],
      },
      {
        name: 'Strength',
        exercises: [
          { exerciseId: 'bench_press',    exerciseName: 'Bench Press',    trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'bent_over_row',  exerciseName: 'Bent Over Row',  trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'overhead_press', exerciseName: 'Overhead Press', trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }] },
        ],
      },
    ],
  },
  {
    title: 'Push',
    variants: [
      {
        name: 'Chest Focus',
        exercises: [
          { exerciseId: 'bench_press',       exerciseName: 'Bench Press',        trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'incline_bench_press', exerciseName: 'Incline Bench Press', trackingType: 'reps_weight', sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
          { exerciseId: 'pec_deck',          exerciseName: 'Pec Deck',           trackingType: 'reps_weight', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }] },
          { exerciseId: 'overhead_press',    exerciseName: 'Overhead Press',     trackingType: 'reps_weight', sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
          { exerciseId: 'lateral_raise',     exerciseName: 'Lateral Raise',      trackingType: 'reps_weight', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }] },
          { exerciseId: 'tricep_pushdown',   exerciseName: 'Tricep Pushdown',    trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
        ],
      },
      {
        name: 'Shoulder Focus',
        exercises: [
          { exerciseId: 'overhead_press',      exerciseName: 'Overhead Press',          trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'db_shoulder_press',   exerciseName: 'Dumbbell Shoulder Press', trackingType: 'reps_weight', sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
          { exerciseId: 'lateral_raise',       exerciseName: 'Lateral Raise',           trackingType: 'reps_weight', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }, { reps: 15 }] },
          { exerciseId: 'front_raise',         exerciseName: 'Front Raise',             trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'dip',                 exerciseName: 'Dip',                     trackingType: 'reps_weight', sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
          { exerciseId: 'skull_crusher',       exerciseName: 'Skull Crusher',           trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
        ],
      },
      {
        name: 'Strength',
        exercises: [
          { exerciseId: 'bench_press',       exerciseName: 'Bench Press',        trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'overhead_press',    exerciseName: 'Overhead Press',     trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'dip',               exerciseName: 'Dip',                trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'close_grip_bench',  exerciseName: 'Close Grip Bench Press', trackingType: 'reps_weight', sets: [{ reps: 6 }, { reps: 6 }, { reps: 6 }] },
        ],
      },
    ],
  },
  {
    title: 'Pull',
    variants: [
      {
        name: 'Back Focus',
        exercises: [
          { exerciseId: 'deadlift',          exerciseName: 'Deadlift',         trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'pull_up',           exerciseName: 'Pull-up',          trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'bent_over_row',     exerciseName: 'Bent Over Row',    trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'seated_cable_row',  exerciseName: 'Seated Cable Row', trackingType: 'reps_weight', sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
          { exerciseId: 'face_pull',         exerciseName: 'Face Pull',        trackingType: 'reps_weight', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }] },
        ],
      },
      {
        name: 'Bicep Focus',
        exercises: [
          { exerciseId: 'chin_up',       exerciseName: 'Chin-up',       trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'lat_pulldown',  exerciseName: 'Lat Pulldown',  trackingType: 'reps_weight', sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
          { exerciseId: 'db_row',        exerciseName: 'Dumbbell Row',  trackingType: 'reps_weight', sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
          { exerciseId: 'barbell_curl',  exerciseName: 'Barbell Curl',  trackingType: 'reps_weight', sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }, { reps: 10 }] },
          { exerciseId: 'hammer_curl',   exerciseName: 'Hammer Curl',   trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'cable_curl',    exerciseName: 'Cable Curl',    trackingType: 'reps_weight', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }] },
        ],
      },
      {
        name: 'Strength',
        exercises: [
          { exerciseId: 'deadlift',      exerciseName: 'Deadlift',      trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'bent_over_row', exerciseName: 'Bent Over Row', trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'pull_up',       exerciseName: 'Pull-up',       trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }] },
        ],
      },
    ],
  },
  {
    title: 'Core',
    variants: [
      {
        name: 'Strength',
        exercises: [
          { exerciseId: 'cable_crunch',      exerciseName: 'Cable Crunch',      trackingType: 'reps_weight', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }, { reps: 15 }] },
          { exerciseId: 'hanging_leg_raise', exerciseName: 'Hanging Leg Raise', trackingType: 'reps_only',   sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'russian_twist',     exerciseName: 'Russian Twist',     trackingType: 'reps_weight', sets: [{ reps: 20 }, { reps: 20 }, { reps: 20 }] },
          { exerciseId: 'ab_wheel',          exerciseName: 'Ab Wheel Rollout',  trackingType: 'reps_only',   sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
        ],
      },
      {
        name: 'Endurance',
        exercises: [
          { exerciseId: 'plank',      exerciseName: 'Plank',      trackingType: 'time',      sets: [{ duration: 60 }, { duration: 60 }, { duration: 60 }] },
          { exerciseId: 'side_plank', exerciseName: 'Side Plank', trackingType: 'time',      sets: [{ duration: 45 }, { duration: 45 }, { duration: 45 }] },
          { exerciseId: 'crunch',     exerciseName: 'Crunch',     trackingType: 'reps_only', sets: [{ reps: 30 }, { reps: 30 }, { reps: 30 }] },
          { exerciseId: 'sit_up',     exerciseName: 'Sit-up',     trackingType: 'reps_only', sets: [{ reps: 20 }, { reps: 20 }, { reps: 20 }] },
          { exerciseId: 'leg_raise',  exerciseName: 'Leg Raise',  trackingType: 'reps_only', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }] },
        ],
      },
      {
        name: 'Quick',
        exercises: [
          { exerciseId: 'plank',             exerciseName: 'Plank',             trackingType: 'time',      sets: [{ duration: 45 }, { duration: 45 }] },
          { exerciseId: 'crunch',            exerciseName: 'Crunch',            trackingType: 'reps_only', sets: [{ reps: 20 }, { reps: 20 }, { reps: 20 }] },
          { exerciseId: 'leg_raise',         exerciseName: 'Leg Raise',         trackingType: 'reps_only', sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }] },
          { exerciseId: 'hanging_leg_raise', exerciseName: 'Hanging Leg Raise', trackingType: 'reps_only', sets: [{ reps: 10 }, { reps: 10 }] },
        ],
      },
    ],
  },
  {
    title: 'Cardio',
    variants: [
      {
        name: 'Steady State',
        exercises: [
          { exerciseId: 'running',  exerciseName: 'Running',  trackingType: 'time', sets: [{ duration: 1800 }] },
          { exerciseId: 'cycling',  exerciseName: 'Cycling',  trackingType: 'time', sets: [{ duration: 600 }] },
        ],
      },
      {
        name: 'HIIT',
        exercises: [
          { exerciseId: 'jump_rope',    exerciseName: 'Jump Rope',    trackingType: 'time', sets: [{ duration: 60 }, { duration: 60 }, { duration: 60 }, { duration: 60 }, { duration: 60 }] },
          { exerciseId: 'rowing',       exerciseName: 'Rowing',       trackingType: 'time', sets: [{ duration: 180 }, { duration: 180 }, { duration: 180 }] },
          { exerciseId: 'battle_ropes', exerciseName: 'Battle Ropes', trackingType: 'time', sets: [{ duration: 40 }, { duration: 40 }, { duration: 40 }] },
        ],
      },
      {
        name: 'Machine',
        exercises: [
          { exerciseId: 'elliptical',    exerciseName: 'Elliptical',    trackingType: 'time', sets: [{ duration: 1200 }] },
          { exerciseId: 'stair_climber', exerciseName: 'Stair Climber', trackingType: 'time', sets: [{ duration: 900 }] },
          { exerciseId: 'rowing',        exerciseName: 'Rowing',        trackingType: 'time', sets: [{ duration: 600 }] },
        ],
      },
    ],
  },
  {
    title: 'Full Body',
    variants: [
      {
        name: 'Big 3',
        exercises: [
          { exerciseId: 'squat',       exerciseName: 'Squat',       trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'bench_press', exerciseName: 'Bench Press', trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'deadlift',    exerciseName: 'Deadlift',    trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }] },
        ],
      },
      {
        name: 'Athletic',
        exercises: [
          { exerciseId: 'squat',          exerciseName: 'Squat',          trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'overhead_press', exerciseName: 'Overhead Press', trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'pull_up',        exerciseName: 'Pull-up',        trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'lunges',         exerciseName: 'Lunges',         trackingType: 'reps_weight', sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
          { exerciseId: 'plank',          exerciseName: 'Plank',          trackingType: 'time',        sets: [{ duration: 60 }, { duration: 60 }] },
        ],
      },
      {
        name: 'Compound',
        exercises: [
          { exerciseId: 'deadlift',      exerciseName: 'Deadlift',      trackingType: 'reps_weight', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }] },
          { exerciseId: 'squat',         exerciseName: 'Squat',         trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'bench_press',   exerciseName: 'Bench Press',   trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'bent_over_row', exerciseName: 'Bent Over Row', trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
          { exerciseId: 'overhead_press', exerciseName: 'Overhead Press', trackingType: 'reps_weight', sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
          { exerciseId: 'pull_up',       exerciseName: 'Pull-up',       trackingType: 'reps_weight', sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
        ],
      },
    ],
  },
]

export function getPreset(title: string): Preset | undefined {
  return PRESETS.find(p => p.title === title)
}
