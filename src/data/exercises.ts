import type { Exercise } from '../types'

export const EXERCISES: Exercise[] = [
  // ── Chest ──────────────────────────────────────────────────────────────────
  { id: 'bench_press',          name: 'Bench Press',            category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: 'incline_bench_press',  name: 'Incline Bench Press',    category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['chest', 'shoulders'] },
  { id: 'decline_bench_press',  name: 'Decline Bench Press',    category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['chest', 'triceps'] },
  { id: 'db_fly',               name: 'Dumbbell Fly',           category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['chest'] },
  { id: 'cable_fly',            name: 'Cable Fly',              category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['chest'] },
  { id: 'chest_press_machine',  name: 'Chest Press Machine',    category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['chest', 'triceps'] },
  { id: 'push_up',              name: 'Push-up',                category: 'bodyweight',  trackingType: 'reps_only',   muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: 'dip',                  name: 'Dip',                    category: 'bodyweight',  trackingType: 'reps_weight', muscleGroups: ['chest', 'triceps'] },
  { id: 'pec_deck',             name: 'Pec Deck',               category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['chest'] },

  // ── Back ───────────────────────────────────────────────────────────────────
  { id: 'deadlift',             name: 'Deadlift',               category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['back', 'glutes', 'hamstrings'] },
  { id: 'romanian_deadlift',    name: 'Romanian Deadlift',      category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['hamstrings', 'glutes', 'back'] },
  { id: 'pull_up',              name: 'Pull-up',                category: 'bodyweight',  trackingType: 'reps_weight', muscleGroups: ['back', 'biceps'] },
  { id: 'chin_up',              name: 'Chin-up',                category: 'bodyweight',  trackingType: 'reps_weight', muscleGroups: ['back', 'biceps'] },
  { id: 'bent_over_row',        name: 'Bent Over Row',          category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['back', 'biceps'] },
  { id: 'db_row',               name: 'Dumbbell Row',           category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['back', 'biceps'] },
  { id: 'lat_pulldown',         name: 'Lat Pulldown',           category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['back', 'biceps'] },
  { id: 'seated_cable_row',     name: 'Seated Cable Row',       category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['back', 'biceps'] },
  { id: 'tbar_row',             name: 'T-Bar Row',              category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['back'] },
  { id: 'face_pull',            name: 'Face Pull',              category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['shoulders', 'back'] },
  { id: 'hyperextension',       name: 'Hyperextension',         category: 'bodyweight',  trackingType: 'reps_weight', muscleGroups: ['back', 'glutes'] },

  // ── Shoulders ──────────────────────────────────────────────────────────────
  { id: 'overhead_press',       name: 'Overhead Press',         category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['shoulders', 'triceps'] },
  { id: 'db_shoulder_press',    name: 'Dumbbell Shoulder Press',category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['shoulders', 'triceps'] },
  { id: 'lateral_raise',        name: 'Lateral Raise',          category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['shoulders'] },
  { id: 'front_raise',          name: 'Front Raise',            category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['shoulders'] },
  { id: 'rear_delt_fly',        name: 'Rear Delt Fly',          category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['shoulders', 'back'] },
  { id: 'arnold_press',         name: 'Arnold Press',           category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['shoulders'] },
  { id: 'upright_row',          name: 'Upright Row',            category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['shoulders', 'back'] },

  // ── Arms ───────────────────────────────────────────────────────────────────
  { id: 'barbell_curl',         name: 'Barbell Curl',           category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['biceps'] },
  { id: 'db_curl',              name: 'Dumbbell Curl',          category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['biceps'] },
  { id: 'hammer_curl',          name: 'Hammer Curl',            category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['biceps', 'forearms'] },
  { id: 'preacher_curl',        name: 'Preacher Curl',          category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['biceps'] },
  { id: 'cable_curl',           name: 'Cable Curl',             category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['biceps'] },
  { id: 'tricep_pushdown',      name: 'Tricep Pushdown',        category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['triceps'] },
  { id: 'skull_crusher',        name: 'Skull Crusher',          category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['triceps'] },
  { id: 'tricep_overhead_ext',  name: 'Tricep Overhead Extension', category: 'strength', trackingType: 'reps_weight', muscleGroups: ['triceps'] },
  { id: 'close_grip_bench',     name: 'Close Grip Bench Press', category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['triceps', 'chest'] },
  { id: 'wrist_curl',           name: 'Wrist Curl',             category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['forearms'] },

  // ── Legs ───────────────────────────────────────────────────────────────────
  { id: 'squat',                name: 'Squat',                  category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['quads', 'glutes', 'hamstrings'] },
  { id: 'front_squat',          name: 'Front Squat',            category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['quads', 'glutes'] },
  { id: 'goblet_squat',         name: 'Goblet Squat',           category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['quads', 'glutes'] },
  { id: 'leg_press',            name: 'Leg Press',              category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['quads', 'glutes'] },
  { id: 'lunges',               name: 'Lunges',                 category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['quads', 'glutes', 'hamstrings'] },
  { id: 'bulgarian_split_squat',name: 'Bulgarian Split Squat',  category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['quads', 'glutes'] },
  { id: 'leg_extension',        name: 'Leg Extension',          category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['quads'] },
  { id: 'leg_curl',             name: 'Leg Curl',               category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['hamstrings'] },
  { id: 'hip_thrust',           name: 'Hip Thrust',             category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['glutes', 'hamstrings'] },
  { id: 'calf_raise',           name: 'Calf Raise',             category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['calves'] },
  { id: 'seated_calf_raise',    name: 'Seated Calf Raise',      category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['calves'] },
  { id: 'glute_kickback',       name: 'Glute Kickback',         category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['glutes'] },
  { id: 'adductor_machine',     name: 'Adductor Machine',       category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['quads'] },
  { id: 'abductor_machine',     name: 'Abductor Machine',       category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['glutes'] },

  // ── Core ───────────────────────────────────────────────────────────────────
  { id: 'plank',                name: 'Plank',                  category: 'bodyweight',  trackingType: 'time',        muscleGroups: ['abs'] },
  { id: 'side_plank',           name: 'Side Plank',             category: 'bodyweight',  trackingType: 'time',        muscleGroups: ['abs'] },
  { id: 'crunch',               name: 'Crunch',                 category: 'bodyweight',  trackingType: 'reps_only',   muscleGroups: ['abs'] },
  { id: 'sit_up',               name: 'Sit-up',                 category: 'bodyweight',  trackingType: 'reps_only',   muscleGroups: ['abs'] },
  { id: 'leg_raise',            name: 'Leg Raise',              category: 'bodyweight',  trackingType: 'reps_only',   muscleGroups: ['abs'] },
  { id: 'russian_twist',        name: 'Russian Twist',          category: 'bodyweight',  trackingType: 'reps_weight', muscleGroups: ['abs'] },
  { id: 'ab_wheel',             name: 'Ab Wheel Rollout',       category: 'bodyweight',  trackingType: 'reps_only',   muscleGroups: ['abs'] },
  { id: 'cable_crunch',         name: 'Cable Crunch',           category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['abs'] },
  { id: 'hanging_leg_raise',    name: 'Hanging Leg Raise',      category: 'bodyweight',  trackingType: 'reps_only',   muscleGroups: ['abs'] },

  // ── Cardio ─────────────────────────────────────────────────────────────────
  { id: 'running',              name: 'Running',                category: 'cardio',      trackingType: 'time',        muscleGroups: ['cardio'] },
  { id: 'cycling',              name: 'Cycling',                category: 'cardio',      trackingType: 'time',        muscleGroups: ['cardio'] },
  { id: 'rowing',               name: 'Rowing',                 category: 'cardio',      trackingType: 'time',        muscleGroups: ['cardio', 'back'] },
  { id: 'jump_rope',            name: 'Jump Rope',              category: 'cardio',      trackingType: 'time',        muscleGroups: ['cardio'] },
  { id: 'elliptical',           name: 'Elliptical',             category: 'cardio',      trackingType: 'time',        muscleGroups: ['cardio'] },
  { id: 'stair_climber',        name: 'Stair Climber',          category: 'cardio',      trackingType: 'time',        muscleGroups: ['cardio', 'glutes'] },
  { id: 'hiit',                 name: 'HIIT',                   category: 'cardio',      trackingType: 'time',        muscleGroups: ['full_body'] },
  { id: 'battle_ropes',         name: 'Battle Ropes',           category: 'cardio',      trackingType: 'time',        muscleGroups: ['full_body'] },
  { id: 'burpee',               name: 'Burpee',                 category: 'bodyweight',  trackingType: 'reps_only',   muscleGroups: ['full_body'] },

  // ── Olympic / Full Body ────────────────────────────────────────────────────
  { id: 'clean_and_jerk',       name: 'Clean & Jerk',           category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['full_body'] },
  { id: 'snatch',               name: 'Snatch',                 category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['full_body'] },
  { id: 'power_clean',          name: 'Power Clean',            category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['full_body'] },
  { id: 'kettlebell_swing',     name: 'Kettlebell Swing',       category: 'strength',    trackingType: 'reps_weight', muscleGroups: ['glutes', 'hamstrings', 'back'] },
  { id: 'farmers_walk',         name: "Farmer's Walk",          category: 'strength',    trackingType: 'time',        muscleGroups: ['full_body', 'forearms'] },
]

export function searchExercises(query: string): Exercise[] {
  const q = query.toLowerCase().trim()
  if (!q) return EXERCISES.slice(0, 8)
  return EXERCISES.filter(e => e.name.toLowerCase().includes(q)).slice(0, 8)
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id)
}
