export type TrackingType = 'reps_weight' | 'time' | 'reps_only'

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body'
  | 'cardio'

export type ExerciseCategory = 'strength' | 'bodyweight' | 'cardio' | 'flexibility'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  trackingType: TrackingType
  muscleGroups: MuscleGroup[]
}

export interface ExerciseSet {
  id: string
  reps?: number
  weight?: number    // kg
  duration?: number  // seconds
  completed: boolean
}

export interface SessionExercise {
  id: string
  exerciseId: string
  exerciseName: string
  trackingType: TrackingType
  sets: ExerciseSet[]
  notes?: string
}

export interface Session {
  id: string
  name?: string          // optional custom label
  tags?: string[]        // e.g. ['Push', 'Pull']
  date: string           // ISO date string YYYY-MM-DD
  startedAt: string      // ISO datetime
  finishedAt?: string    // ISO datetime
  exercises: SessionExercise[]
  notes?: string
  templateId?: string
  fogProgramId?: string    // set when this was a class session — which program it belonged to
  method?: string          // training method of a class session, e.g. 'Step Intervals'
  fogSessionIndex?: number // 0-based position of this session within its program
}

export interface Template {
  id: string
  name: string
  exerciseIds: string[]
  createdAt: string
}

export interface BodyweightEntry {
  id: string
  date: string   // ISO date YYYY-MM-DD
  weight: number // always stored in kg
}

export interface PlannedWorkout {
  id: string
  date: string   // YYYY-MM-DD
  title?: string // e.g. "Legs", "Upper"
}

export type WeightUnit = 'kg' | 'lbs'

// Base colour theme (primary accent; `mono` also retints the neutrals to the
// original pre-redesign look).
export type BaseTheme = 'blue' | 'red' | 'green' | 'yellow' | 'mono'

export interface UserPreferences {
  weightUnit: WeightUnit
  restTimerDefault: number // seconds
  darkMode: boolean
  theme?: BaseTheme        // base colour theme; undefined = 'blue'
  planSessionIndex: number // which session in the training plan is next (0-based)
  programProgress: Record<string, number> // fogProgramId -> next session index
}
