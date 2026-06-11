import type { TrackingType } from '../types'
import { getExerciseById } from './exercises'

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

// A slot is one position in the workout; each session one option is picked at random
export interface PresetSlot {
  options: PresetExercise[]
}

export interface PresetVariant {
  name: string
  slots: PresetSlot[]
}

export interface Preset {
  title: string
  variants: PresetVariant[]
}

// n sets of `reps` reps
const r = (n: number, reps: number): PresetSet[] => Array.from({ length: n }, () => ({ reps }))
// n sets of `secs` seconds
const t = (n: number, secs: number): PresetSet[] => Array.from({ length: n }, () => ({ duration: secs }))

// Build a preset exercise from the catalog so names and tracking types stay in sync
function o(exerciseId: string, sets: PresetSet[]): PresetExercise {
  const e = getExerciseById(exerciseId)
  if (!e) throw new Error(`Unknown exercise id in preset: ${exerciseId}`)
  return { exerciseId, exerciseName: e.name, trackingType: e.trackingType, sets }
}

const slot = (...options: PresetExercise[]): PresetSlot => ({ options })

export const PRESETS: Preset[] = [
  {
    title: 'Legs',
    variants: [
      {
        name: 'Strength',
        slots: [
          slot(o('squat', r(5, 5)), o('front_squat', r(5, 5))),
          slot(o('deadlift', r(3, 5)), o('romanian_deadlift', r(3, 8))),
          slot(o('leg_press', r(4, 6)), o('hip_thrust', r(4, 8)), o('bulgarian_split_squat', r(4, 8))),
          slot(o('hip_thrust', r(3, 8)), o('leg_curl', r(3, 10)), o('lunges', r(3, 10))),
        ],
      },
      {
        name: 'Hypertrophy',
        slots: [
          slot(o('squat', r(4, 10)), o('leg_press', r(4, 10)), o('goblet_squat', r(4, 12))),
          slot(o('bulgarian_split_squat', r(3, 12)), o('lunges', r(3, 12)), o('front_squat', r(3, 10))),
          slot(o('leg_extension', r(3, 15)), o('adductor_machine', r(3, 15))),
          slot(o('leg_curl', r(3, 15)), o('romanian_deadlift', r(3, 12)), o('glute_kickback', r(3, 15))),
          slot(o('calf_raise', r(4, 15)), o('seated_calf_raise', r(4, 20))),
        ],
      },
      {
        name: 'Quick',
        slots: [
          slot(o('goblet_squat', r(3, 12)), o('jump_squat', r(3, 15))),
          slot(o('lunges', r(3, 12)), o('bulgarian_split_squat', r(3, 12)), o('glute_bridge', r(3, 15))),
          slot(o('leg_press', r(3, 15)), o('leg_extension', r(3, 15)), o('hip_thrust', r(3, 12))),
          slot(o('seated_calf_raise', r(3, 20)), o('calf_raise', r(3, 20))),
        ],
      },
    ],
  },
  {
    title: 'Upper',
    variants: [
      {
        name: 'Compound',
        slots: [
          slot(o('bench_press', r(4, 8)), o('incline_bench_press', r(4, 8))),
          slot(o('bent_over_row', r(4, 8)), o('tbar_row', r(4, 8)), o('db_row', r(4, 8))),
          slot(o('overhead_press', r(3, 8)), o('db_shoulder_press', r(3, 8))),
          slot(o('pull_up', r(3, 8)), o('chin_up', r(3, 8)), o('lat_pulldown', r(3, 10))),
        ],
      },
      {
        name: 'Volume',
        slots: [
          slot(o('bench_press', r(3, 12)), o('chest_press_machine', r(3, 12)), o('incline_bench_press', r(3, 12))),
          slot(o('db_row', r(3, 12)), o('seated_cable_row', r(3, 12)), o('tbar_row', r(3, 12))),
          slot(o('lat_pulldown', r(3, 12)), o('pull_up', r(3, 10))),
          slot(o('db_shoulder_press', r(3, 12)), o('arnold_press', r(3, 12)), o('lateral_raise', r(3, 15))),
          slot(o('db_curl', r(3, 12)), o('hammer_curl', r(3, 12)), o('cable_curl', r(3, 12))),
          slot(o('tricep_pushdown', r(3, 12)), o('skull_crusher', r(3, 12)), o('tricep_overhead_ext', r(3, 12))),
        ],
      },
      {
        name: 'Strength',
        slots: [
          slot(o('bench_press', r(5, 5))),
          slot(o('bent_over_row', r(5, 5)), o('tbar_row', r(5, 5))),
          slot(o('overhead_press', r(3, 5)), o('db_shoulder_press', r(3, 6))),
        ],
      },
    ],
  },
  {
    title: 'Push',
    variants: [
      {
        name: 'Chest Focus',
        slots: [
          slot(o('bench_press', r(4, 8)), o('chest_press_machine', r(4, 10))),
          slot(o('incline_bench_press', r(3, 10)), o('decline_bench_press', r(3, 10)), o('db_fly', r(3, 12))),
          slot(o('pec_deck', r(3, 15)), o('cable_fly', r(3, 15)), o('db_fly', r(3, 12))),
          slot(o('overhead_press', r(3, 10)), o('db_shoulder_press', r(3, 10))),
          slot(o('lateral_raise', r(3, 15)), o('front_raise', r(3, 12))),
          slot(o('tricep_pushdown', r(3, 12)), o('tricep_overhead_ext', r(3, 12)), o('skull_crusher', r(3, 12))),
        ],
      },
      {
        name: 'Shoulder Focus',
        slots: [
          slot(o('overhead_press', r(4, 8)), o('arnold_press', r(4, 10))),
          slot(o('db_shoulder_press', r(3, 10)), o('upright_row', r(3, 12))),
          slot(o('lateral_raise', r(4, 15))),
          slot(o('front_raise', r(3, 12)), o('rear_delt_fly', r(3, 15)), o('face_pull', r(3, 15))),
          slot(o('dip', r(3, 10)), o('pike_push_up', r(3, 12))),
          slot(o('skull_crusher', r(3, 12)), o('tricep_pushdown', r(3, 12))),
        ],
      },
      {
        name: 'Strength',
        slots: [
          slot(o('bench_press', r(5, 5))),
          slot(o('overhead_press', r(3, 5))),
          slot(o('dip', r(3, 8)), o('incline_bench_press', r(3, 6))),
          slot(o('close_grip_bench', r(3, 6)), o('skull_crusher', r(3, 8))),
        ],
      },
    ],
  },
  {
    title: 'Pull',
    variants: [
      {
        name: 'Back Focus',
        slots: [
          slot(o('deadlift', r(3, 5)), o('romanian_deadlift', r(3, 8))),
          slot(o('pull_up', r(4, 8)), o('lat_pulldown', r(4, 10))),
          slot(o('bent_over_row', r(3, 8)), o('tbar_row', r(3, 8)), o('db_row', r(3, 10))),
          slot(o('seated_cable_row', r(3, 10)), o('db_row', r(3, 10))),
          slot(o('face_pull', r(3, 15)), o('rear_delt_fly', r(3, 15))),
        ],
      },
      {
        name: 'Bicep Focus',
        slots: [
          slot(o('chin_up', r(4, 8)), o('pull_up', r(4, 8))),
          slot(o('lat_pulldown', r(3, 10)), o('seated_cable_row', r(3, 10))),
          slot(o('db_row', r(3, 10)), o('bent_over_row', r(3, 10))),
          slot(o('barbell_curl', r(4, 10)), o('preacher_curl', r(4, 10)), o('db_curl', r(4, 10))),
          slot(o('hammer_curl', r(3, 12)), o('cable_curl', r(3, 12))),
          slot(o('cable_curl', r(3, 15)), o('db_curl', r(3, 15)), o('wrist_curl', r(3, 15))),
        ],
      },
      {
        name: 'Strength',
        slots: [
          slot(o('deadlift', r(5, 5))),
          slot(o('bent_over_row', r(5, 5)), o('tbar_row', r(5, 5))),
          slot(o('pull_up', r(3, 5)), o('chin_up', r(3, 5))),
        ],
      },
    ],
  },
  {
    title: 'Core',
    variants: [
      {
        name: 'Strength',
        slots: [
          slot(o('cable_crunch', r(4, 15)), o('russian_twist', r(4, 20))),
          slot(o('hanging_leg_raise', r(3, 12)), o('leg_raise', r(3, 15))),
          slot(o('russian_twist', r(3, 20)), o('sit_up', r(3, 20)), o('mountain_climber', r(3, 30))),
          slot(o('ab_wheel', r(3, 10)), o('plank', t(3, 60))),
        ],
      },
      {
        name: 'Endurance',
        slots: [
          slot(o('plank', t(3, 60)), o('side_plank', t(3, 45))),
          slot(o('side_plank', t(3, 45)), o('mountain_climber', r(3, 30))),
          slot(o('crunch', r(3, 30)), o('sit_up', r(3, 20))),
          slot(o('leg_raise', r(3, 15)), o('glute_bridge', r(3, 20)), o('sit_up', r(3, 20))),
        ],
      },
      {
        name: 'Quick',
        slots: [
          slot(o('plank', t(2, 45)), o('side_plank', t(2, 40))),
          slot(o('crunch', r(3, 20)), o('sit_up', r(3, 15))),
          slot(o('leg_raise', r(3, 15)), o('mountain_climber', r(3, 25))),
          slot(o('hanging_leg_raise', r(2, 10)), o('ab_wheel', r(2, 8))),
        ],
      },
    ],
  },
  {
    title: 'Cardio',
    variants: [
      {
        name: 'Steady State',
        slots: [
          slot(o('running', t(1, 1800)), o('cycling', t(1, 1800)), o('elliptical', t(1, 1800))),
          slot(o('cycling', t(1, 600)), o('rowing', t(1, 600)), o('stair_climber', t(1, 600))),
        ],
      },
      {
        name: 'HIIT',
        slots: [
          slot(o('jump_rope', t(5, 60)), o('burpee', r(5, 15))),
          slot(o('rowing', t(3, 180)), o('hiit', t(3, 180))),
          slot(o('battle_ropes', t(3, 40)), o('mountain_climber', r(3, 30)), o('jump_squat', r(3, 15))),
        ],
      },
      {
        name: 'Machine',
        slots: [
          slot(o('elliptical', t(1, 1200)), o('stair_climber', t(1, 1200)), o('cycling', t(1, 1200))),
          slot(o('stair_climber', t(1, 900)), o('rowing', t(1, 900))),
          slot(o('rowing', t(1, 600)), o('cycling', t(1, 600))),
        ],
      },
    ],
  },
  {
    title: 'Full Body',
    variants: [
      {
        name: 'Big 3',
        slots: [
          slot(o('squat', r(5, 5)), o('front_squat', r(5, 5))),
          slot(o('bench_press', r(5, 5))),
          slot(o('deadlift', r(3, 5))),
        ],
      },
      {
        name: 'Athletic',
        slots: [
          slot(o('squat', r(3, 8)), o('goblet_squat', r(3, 10)), o('jump_squat', r(3, 12))),
          slot(o('overhead_press', r(3, 8)), o('db_shoulder_press', r(3, 8))),
          slot(o('pull_up', r(3, 8)), o('bodyweight_row', r(3, 10))),
          slot(o('lunges', r(3, 12)), o('kettlebell_swing', r(3, 15))),
          slot(o('plank', t(2, 60)), o('farmers_walk', t(2, 40))),
        ],
      },
      {
        name: 'Compound',
        slots: [
          slot(o('deadlift', r(3, 5)), o('power_clean', r(3, 5))),
          slot(o('squat', r(3, 8)), o('leg_press', r(3, 10))),
          slot(o('bench_press', r(3, 8)), o('chest_press_machine', r(3, 10))),
          slot(o('bent_over_row', r(3, 8)), o('seated_cable_row', r(3, 10))),
          slot(o('overhead_press', r(3, 10)), o('db_shoulder_press', r(3, 10))),
          slot(o('pull_up', r(3, 8)), o('lat_pulldown', r(3, 10))),
        ],
      },
    ],
  },
]

// Pick one option per slot at random, avoiding the same exercise twice in one workout
export function rollVariant(variant: PresetVariant): PresetExercise[] {
  const used = new Set<string>()
  return variant.slots.map(s => {
    const fresh = s.options.filter(opt => !used.has(opt.exerciseId))
    const pool = fresh.length > 0 ? fresh : s.options
    const choice = pool[Math.floor(Math.random() * pool.length)]
    used.add(choice.exerciseId)
    return choice
  })
}

export function getPreset(title: string): Preset | undefined {
  return PRESETS.find(p => p.title === title)
}
