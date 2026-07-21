import { nanoid } from './nanoid'
import type { FogFlatSession, FogProgram } from '../data/fogPrograms'
import type { SessionExercise } from '../types'

export const FOCUS_TO_TAGS: Record<string, string[]> = {
  'Push': ['Push'],
  'Pull': ['Pull'],
  'Push/Pull': ['Push', 'Pull'],
  'Legs': ['Legs'],
  'Core': ['Core'],
  'Legs/Core': ['Legs', 'Core'],
  'Full Body': ['Full Body'],
}

export function makeClassExercises(session: FogFlatSession, programId: string): SessionExercise[] {
  return session.exercises.map(name => ({
    id: nanoid(),
    exerciseId: `fog_${programId}_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
    exerciseName: name,
    trackingType: 'reps_only' as const,
    sets: [{ id: nanoid(), completed: false }],
  }))
}

interface ClassStartNavState {
  fogProgramId: string
  name: string
  tags: string[]
  method: string
  repeat: SessionExercise[]
}

/** Nav state for starting a class session — used by both Classes and Home. */
export function buildClassStartState(program: FogProgram, session: FogFlatSession): ClassStartNavState {
  const tags = FOCUS_TO_TAGS[session.focus] ?? [session.focus]
  return {
    fogProgramId: program.id,
    name: tags.join(' · '),
    tags,
    method: session.method,
    repeat: makeClassExercises(session, program.id),
  }
}

/** The program currently in progress: first program with 0 < index < total. */
export function findActiveProgramId(
  programs: FogProgram[],
  progress: Record<string, number>,
  flatten: (p: FogProgram) => FogFlatSession[],
): string | null {
  const found = programs.find(p => {
    const i = progress[p.id] ?? 0
    return i > 0 && i < flatten(p).length
  })
  return found?.id ?? null
}
