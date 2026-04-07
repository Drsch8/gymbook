// "Fit ohne Geräte" program data
// Four classes: Basisprogramm, First Class, Master Class, Chief Class

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
        phase: 'Wechselblock',
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
    name: 'Stufenintervall',
    shortName: 'Stufenintervalle',
    description:
      'Pyramide: 1 Wdh., Pause, 2 Wdh., Pause, 3 Wdh. … bis kurz vor Muskelversagen, dann rückwärts. Pause = Länge des vorigen Intervalls. 7,5 Minuten pro Übung.',
  },
  {
    name: 'Intervallsatz',
    shortName: 'Intervallsätze',
    description:
      '3 Sätze pro Übung, 6–12 Wiederholungen. 3-Minuten-Intervalle: Beginn bei 0 min, 3 min, 6 min – jeweils bis Muskelversagen oder 12 Wdh.',
  },
  {
    name: 'Supersatz',
    shortName: 'Supersätze',
    description:
      '4-Minuten-Intervalle. Übungspaare: 1–5 Wdh. bei der ersten, 6–12 Wdh. bei der zweiten Übung. 2 Supersätze pro Paar, insgesamt 6 Supersätze.',
  },
  {
    name: 'Zirkelintervall',
    shortName: 'Zirkelintervalle',
    description:
      'So viele Runden der vorgegebenen Übungen wie möglich in 20 Minuten – ohne Pause, außer bei Muskelversagen.',
  },
  {
    name: 'Hochintensitätssatz',
    shortName: 'Hochintensitätssätze',
    description:
      '8 Runden: 20 Sekunden Training + 10 Sekunden Pause = 4 Minuten gesamt. Gleichbleibendes Tempo über alle Sätze halten.',
  },
]

// ── Basisprogramm ─────────────────────────────────────────────────────────────

const BEGINNER: FogProgram = {
  id: 'beginner',
  name: 'Basisprogramm',
  subtitle: 'für Einsteiger',
  requirements: [],
  blocks: [
    {
      weekLabel: 'Woche 1 und 2',
      weeks: [1, 2],
      phase: 'Muskuläre Ausdauer',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1,
          focus: 'Drücken/Ziehen',
          method: 'Stufenintervalle',
          exercises: [
            'Liegestütz (Hände erhöht)',
            'Türziehen',
            'Trizepsdip mit Stuhl (Füße auf dem Boden)',
            'Umgekehrtes Bankdrücken mit gebeugten Knien',
          ],
        },
        {
          day: 2,
          focus: 'Beine/Core',
          method: 'Stufenintervalle',
          exercises: [
            'Ausfallschritt nach hinten im Wechsel',
            'Rumänisches Kreuzheben auf einem Bein im Wechsel',
            'Kniebeuge',
            'Schwimmer',
          ],
        },
        {
          day: 3,
          focus: 'Drücken/Ziehen',
          method: 'Stufenintervalle',
          exercises: [
            'Liegestütz (Hände erhöht)',
            'Türziehen',
            'Trizepsdip mit Stuhl (Füße auf dem Boden)',
            'Umgekehrtes Bankdrücken mit gebeugten Knien',
          ],
        },
        {
          day: 4,
          focus: 'Beine/Core',
          method: 'Stufenintervalle',
          exercises: [
            'Seitlicher Ausfallschritt',
            'Rumänisches Kreuzheben auf einem Bein im Wechsel',
            'Kniebeuge mit 1–3 Sek. Haltezeit am tiefsten Punkt',
            'Schräger Crunch',
          ],
        },
      ],
    },
    {
      weekLabel: 'Woche 3 und 4',
      weeks: [3, 4],
      phase: 'Kraft',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1,
          focus: 'Drücken',
          method: 'Intervallsätze',
          exercises: [
            'Liegestütz',
            'Military Press (Hände erhöht)',
            'Enger Liegestütz (Hände erhöht)',
            'Trizepsdip mit Stuhl',
          ],
        },
        {
          day: 2,
          focus: 'Beine',
          method: 'Intervallsätze',
          exercises: [
            'Kniebeuge im Ausfallschritt',
            'Seitlicher Ausfallschritt',
            'Kniebeuge mit 1–3 Sek. Haltezeit am tiefsten Punkt',
            'Rumänisches Kreuzheben auf einem Bein auf einem Kissen',
          ],
        },
        {
          day: 3,
          focus: 'Ziehen',
          method: 'Intervallsätze',
          exercises: [
            'Türziehen',
            'Umgekehrtes Bankdrücken mit gebeugten Knien',
            'Türziehen im Untergriff',
            'Curl mit Handtuch',
          ],
        },
        {
          day: 4,
          focus: 'Core',
          method: 'Intervallsätze',
          exercises: [
            'Beinheber',
            'Strecken (Hände unter dem Kinn, s. Superman)',
            'Russischer Twist',
            'Schwimmer',
          ],
        },
      ],
    },
    {
      weekLabel: 'Woche 5 und 6',
      weeks: [5, 6],
      phase: 'Power-Block',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1,
          focus: 'Drücken',
          method: 'Supersätze',
          exercises: [
            'Liegestütz (Füße erhöht) / Liegestütz mit Abstoßen',
            'Military Press / Daumen hoch',
            'Enger Liegestütz / Trizepsdip mit Stuhl',
          ],
        },
        {
          day: 2,
          focus: 'Beine',
          method: 'Supersätze',
          exercises: [
            'Ausfallschritt nach hinten (4–6 Sek.) / Gesprungene Kniebeuge',
            'Ausfallschritt nach vorn (4–6 Sek.) / Seitlicher Ausfallschritt',
            'Rumänisches Kreuzheben auf einem Kissen / Kniebeuge mit 1–3 Sek.',
          ],
        },
        {
          day: 3,
          focus: 'Ziehen',
          method: 'Supersätze',
          exercises: [
            'Türklimmzug / Türziehen',
            'Türziehen mit 4–6 Sek. / Curl mit Handtuch',
            'Umgekehrtes Bankdrücken im Untergriff / Türziehen im Untergriff',
          ],
        },
        {
          day: 4,
          focus: 'Core',
          method: 'Supersätze',
          exercises: [
            'V-Up / Russischer Twist',
            'Superman / Schwimmer',
            'Hängendes Beinheben mit gebeugten Knien / Beinheber',
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
          day: 1, focus: 'Drücken', method: 'Stufenintervalle',
          exercises: [
            'Military Press (Hände erhöht)',
            'Liegestütz (Hände erhöht)',
            'Enger Liegestütz (Hände erhöht)',
            'Trizepsdip mit Stuhl (gebeugten Knien)',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Supersätze',
          exercises: [
            'Ausfallschritt nach hinten (4–6 Sek.) / Gesprungene Kniebeuge',
            'Ausfallschritt nach vorn (4–6 Sek.) / Seitlicher Ausfallschritt',
            'Rumänisches Kreuzheben auf einem Kissen (1–3 Sek.) / Pogo-Sprünge',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Intervallsätze',
          exercises: [
            'Türziehen',
            'Umgekehrtes Bankdrücken mit gebeugten Knien',
            'Türziehen im Untergriff',
            'Curl mit Handtuch',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Hochintensitätssätze',
          exercises: ['Russischer Twist', 'Strandschere', 'Knieheben im Stehen'],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: ['10 Ausfallschritte nach hinten im Wechsel', '8 × Türziehen', '6 Liegestütze'],
        },
      ],
    },
    {
      week: 8,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Hochintensitätssätze',
          exercises: [
            'Liegestütz (Hände brusthoch abgestützt)',
            'Schaukelstuhl',
            'Doppelter Liegestützsprung (Burpee ohne Liegestütz)',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Stufenintervalle',
          exercises: [
            'Ausfallschritt nach hinten im Wechsel',
            'Rumänisches Kreuzheben auf einem Bein',
            'Kniebeuge mit 1–3 Sek.',
            'Good Mornings mit 1–3 Sek.',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Supersätze',
          exercises: [
            'Türklimmzug / Türziehen',
            'Türziehen (4–6 Sek.) / Umgekehrtes Bankdrücken',
            'Umgekehrtes Bankdrücken im Untergriff / Türziehen im Untergriff',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Intervallsätze',
          exercises: ['Beinheber', 'Strecken (s. Superman)', 'Russischer Twist', 'Schwimmer'],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: ['10 Ausfallschritte nach hinten im Wechsel', '8 × Türziehen', '6 Liegestütze'],
        },
      ],
    },
    {
      week: 9,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Intervallsätze',
          exercises: ['Liegestütz', 'Military Press (Hände erhöht)', 'Enger Liegestütz (Hände erhöht)'],
        },
        {
          day: 2, focus: 'Beine', method: 'Hochintensitätssätze',
          exercises: ['Beat Your Boots', 'Ausfallschritt', 'Good Mornings'],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Stufenintervalle',
          exercises: [
            'Umgekehrtes Bankdrücken mit gebeugten Knien',
            'Türziehen',
            'Umgekehrtes Bankdrücken im Untergriff mit gebeugten Knien',
            'Türziehen im Untergriff',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersätze',
          exercises: ['V-Up / Russischer Twist', 'Superman / Schwimmer', 'Fahrradfahren / Beinheber'],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: ['10 Ausfallschritte nach hinten im Wechsel', '8 × Türziehen', '6 Liegestütze'],
        },
      ],
    },
    {
      week: 10,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Supersätze',
          exercises: [
            'Liegestütz (Füße erhöht) / Liegestütz mit Abstoßen',
            'Military Press / Daumen hoch',
            'Enger Liegestütz / Trizepsdip mit Stuhl',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Intervallsätze',
          exercises: [
            'Kniebeuge im Ausfallschritt',
            'Seitlicher Ausfallschritt',
            'Kniebeuge mit 4–6 Sek.',
            'Rumänisches Kreuzheben auf einem Bein auf einem Kissen',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Hochintensitätssätze',
          exercises: ['Türziehen (Füße hinter den Händen)', 'Fliegende Grätsche', 'Curl mit Handtuch'],
        },
        {
          day: 4, focus: 'Core', method: 'Stufenintervalle',
          exercises: [
            'Crunch It Up',
            'Strecken (Arme seitlich eng am Körper, s. Superman)',
            'Beinheber',
            'Strecken (nur Unterkörper anheben, s. Superman)',
          ],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: ['10 Ausfallschritte nach hinten im Wechsel', '8 × Türziehen', '6 Liegestütze'],
        },
      ],
    },
  ],
  totalSessions: 44,
}

// ── First Class ───────────────────────────────────────────────────────────────

const FIRST: FogProgram = {
  id: 'first',
  name: 'First Class',
  subtitle: 'für Trainingserfahrene',
  requirements: [
    { category: 'Drücken', text: '10 Liegestütze mit je 2 Sek. Haltezeit in höchster und tiefster Position' },
    { category: 'Ziehen', text: '10 × umgekehrtes Bankdrücken mit gestreckten Beinen, Fersen auf dem Boden' },
    { category: 'Beine', text: '15 Ausfallschritte nach hinten auf jedem Bein mit 3 Sek. Haltezeit am tiefsten Punkt' },
    { category: 'Core', text: 'Liegestützposition für 1 Minute halten' },
  ],
  blocks: [
    {
      weekLabel: 'Woche 1 und 2',
      weeks: [1, 2],
      phase: 'Muskuläre Ausdauer',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Drücken/Ziehen', method: 'Stufenintervalle',
          exercises: ['Liegestütz', 'Umgekehrtes Bankdrücken', 'Military Press', 'Türziehen'],
        },
        {
          day: 2, focus: 'Beine/Core', method: 'Stufenintervalle',
          exercises: [
            'Ausfallschritt nach hinten im Wechsel (1–3 Sek.)',
            'Rumänisches Kreuzheben auf einem Bein im Wechsel',
            'Gesprungene Kniebeuge mit 1–3 Sek.',
            'Strecken (Arme seitlich, s. Superman)',
          ],
        },
        {
          day: 3, focus: 'Drücken/Ziehen', method: 'Stufenintervalle',
          exercises: ['Liegestütz', 'Umgekehrtes Bankdrücken', 'Military Press', 'Türziehen'],
        },
        {
          day: 4, focus: 'Beine/Core', method: 'Stufenintervalle',
          exercises: [
            'Seitlicher Ausfallschritt im Wechsel (1–3 Sek.)',
            'Rumänisches Kreuzheben auf einem Bein im Wechsel',
            'Gesprungene Kniebeuge mit 1–3 Sek.',
            'Russischer Twist',
          ],
        },
      ],
    },
    {
      weekLabel: 'Woche 3 und 4',
      weeks: [3, 4],
      phase: 'Kraft',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Intervallsätze',
          exercises: [
            'Liegestütz (Füße erhöht)',
            'Military Press',
            'Enger Liegestütz',
            'Trizepsdip (Fußspitzen auf Stuhl)',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Intervallsätze',
          exercises: [
            'Kniebeuge im Ausfallschritt (1–3 Sek.)',
            'Seitlicher Ausfallschritt (4–6 Sek.)',
            'Gesprungene Kniebeuge (4–6 Sek.)',
            'Rumänisches Kreuzheben auf einem Kissen',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Intervallsätze',
          exercises: ['Türklimmzug', 'Umgekehrtes Bankdrücken', 'Türziehen', 'Curl mit Handtuch'],
        },
        {
          day: 4, focus: 'Core', method: 'Intervallsätze',
          exercises: ['Beinheber mit gekreuzten Armen', 'Superman', 'Fahrradfahren', 'Strecken (Hände unter dem Kinn)'],
        },
      ],
    },
    {
      weekLabel: 'Woche 5 und 6',
      weeks: [5, 6],
      phase: 'Power-Block',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Supersätze',
          exercises: [
            'Liegestütz (Füße erhöht, 1–3 Sek.) / Liegestütz mit Abstoßen',
            'Military Press (Füße erhöht) / Daumen hoch',
            'Enger Liegestütz (Füße erhöht) / Trizepsdip',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Supersätze',
          exercises: [
            'Einbeinige Kniebeuge im Wechsel (Stuhl) / Gesprungene Kniebeuge (4–6 Sek.)',
            'Seitlicher Ausfallschritt (4–6 Sek.) / Ausfallschritt nach hinten (1–3 Sek.)',
            'Rumänisches Kreuzheben auf Kissen (1–3 Sek.) / Kistensprung',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Supersätze',
          exercises: [
            'Türklimmzug / Türziehen',
            'Türziehen (4–6 Sek.) / Umgekehrtes Bankdrücken',
            'Umgekehrtes Bankdrücken im Untergriff (Füße erhöht) / Türziehen im Untergriff',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersätze',
          exercises: [
            'Hängendes Beinheben mit gebeugten Knien / Beintwist mit gebeugten Knien',
            'Einbeiniger Hüftstrecker im Wechsel / Superman',
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
          day: 1, focus: 'Drücken', method: 'Stufenintervalle',
          exercises: ['Chinesischer Liegestütz', 'Liegestütz', 'Enger Liegestütz', 'Trizepsdip mit Stuhl'],
        },
        {
          day: 2, focus: 'Beine', method: 'Supersätze',
          exercises: [
            'Einbeinige Kniebeuge im Wechsel (2 Stühle) / Gesprungene Kniebeuge (4–6 Sek.)',
            'Seitlicher Ausfallschritt (4–6 Sek.) / Ausfallschritt nach hinten (1–3 Sek.)',
            'Rumänisches Kreuzheben auf Kissen (1–3 Sek.) / Kistensprung',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Intervallsätze',
          exercises: ['Türklimmzug', 'Umgekehrtes Bankdrücken', 'Türziehen', 'Curl mit Handtuch'],
        },
        {
          day: 4, focus: 'Core', method: 'Hochintensitätssätze',
          exercises: ['Russischer Twist', 'Beinscheren-Crunch', 'Kniebeuge'],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: ['6 × Umgekehrtes Bankdrücken mit gebeugten Knien', '12 seitliche Ausfallschritte im Wechsel', '8 Liegestütze'],
        },
      ],
    },
    {
      week: 8,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Hochintensitätssätze',
          exercises: ['Liegestütz (Hände erhöht)', 'Trizepsdip mit Stuhl (Füße am Boden)', 'Kniebeuge'],
        },
        {
          day: 2, focus: 'Beine', method: 'Stufenintervalle',
          exercises: [
            'Ausfallschritt nach hinten im Wechsel (1–3 Sek.)',
            'Seitlicher Ausfallschritt',
            'Gesprungene Kniebeuge mit 1–3 Sek.',
            'Rumänisches Kreuzheben auf einem Bein im Wechsel',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Supersätze',
          exercises: [
            'Türklimmzug / Türziehen',
            'Türziehen (4–6 Sek.) / Umgekehrtes Bankdrücken',
            'Umgekehrtes Bankdrücken im Untergriff (Füße erhöht) / Türziehen im Untergriff',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Intervallsätze',
          exercises: ['Beinheber mit gekreuzten Armen', 'Superman', 'Fahrradfahren', 'Strecken (Hände unter dem Kinn)'],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: ['6 × Umgekehrtes Bankdrücken mit gebeugten Knien', '12 seitliche Ausfallschritte im Wechsel', '8 Liegestütze'],
        },
      ],
    },
    {
      week: 9,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Intervallsätze',
          exercises: [
            'Liegestütz (Füße erhöht)',
            'Chinesischer Liegestütz (Hände erhöht)',
            'Enger Liegestütz (Hände erhöht)',
            'Trizepsdip mit Stuhl',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Hochintensitätssätze',
          exercises: ['Iron Mike', 'Seitsprung', 'Kniebeuge'],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Stufenintervalle',
          exercises: [
            'Umgekehrtes Bankdrücken',
            'Türziehen',
            'Umgekehrtes Bankdrücken im Untergriff',
            'Türziehen im Untergriff',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersätze',
          exercises: [
            'Hängendes Beinheben mit gebeugten Knien / Beintwist',
            'Hüftstrecker mit einem Bein im Wechsel / Superman',
            'V-Up / Russischer Twist',
          ],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: ['6 × Umgekehrtes Bankdrücken mit gebeugten Knien', '12 seitliche Ausfallschritte im Wechsel', '8 Liegestütze'],
        },
      ],
    },
    {
      week: 10,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Supersätze',
          exercises: [
            'Liegestütz (Füße erhöht, 1–3 Sek.) / Liegestütz mit Abstoßen',
            'Military Press (Füße erhöht) / Überkopfpresse',
            'Enger Liegestütz (Füße erhöht) / Trizepsdip mit Stuhl',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Intervallsätze',
          exercises: [
            'Kniebeuge im Ausfallschritt (1–3 Sek.)',
            'Seitlicher Ausfallschritt (4–6 Sek.)',
            'Gesprungene Kniebeuge (4–6 Sek.)',
            'Rumänisches Kreuzheben auf einem Kissen',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Hochintensitätssätze',
          exercises: ['Umgekehrtes Bankdrücken', 'Türziehen', 'Kniebeuge'],
        },
        {
          day: 4, focus: 'Core', method: 'Stufenintervalle',
          exercises: ['Fahrradfahren', 'Strecken (Hände unter dem Kinn)', 'Gegrätschter Beinscheren-Crunch', 'Schwimmer'],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: ['6 × Umgekehrtes Bankdrücken mit gebeugten Knien', '12 seitliche Ausfallschritte im Wechsel', '8 Liegestütze'],
        },
      ],
    },
  ],
  totalSessions: 44,
}

// ── Master Class ──────────────────────────────────────────────────────────────

const MASTER: FogProgram = {
  id: 'master',
  name: 'Master Class',
  subtitle: 'für Fortgeschrittene',
  requirements: [
    { category: 'Drücken', text: '16 einarmige Liegestütze im Wechsel (Hand erhöht) – 8 pro Seite' },
    { category: 'Ziehen', text: '4 Klimmzüge mit je 2 Sek. Haltezeit in höchster und tiefster Position' },
    { category: 'Beine', text: '24 einbeinige Kniebeugen im Wechsel (Gesäß leicht absetzen erlaubt) – 12 pro Seite' },
    { category: 'Core', text: 'Liegestützposition für 3 Minuten halten' },
  ],
  blocks: [
    {
      weekLabel: 'Woche 1 und 2',
      weeks: [1, 2],
      phase: 'Muskuläre Ausdauer',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Drücken/Ziehen', method: 'Stufenintervalle',
          exercises: [
            'Einarmiger Liegestütz im Wechsel (Hand erhöht)',
            'Türklimmzug (Füße auf Stuhl oder Hochspringen)',
            'Military Press (Füße erhöht)',
            'Umgekehrtes Bankdrücken',
          ],
        },
        {
          day: 2, focus: 'Beine/Core', method: 'Stufenintervalle',
          exercises: [
            'Einbeinige Kniebeuge im Wechsel (Stuhllehne festhalten)',
            'Ausfallschritt nach hinten mit 4–6 Sek.',
            'Hüftstrecker',
            'Superman',
          ],
        },
        {
          day: 3, focus: 'Drücken/Ziehen', method: 'Stufenintervalle',
          exercises: [
            'Einarmiger Liegestütz im Wechsel (Hand erhöht)',
            'Türklimmzug (Füße auf Stuhl oder Hochspringen)',
            'Military Press',
            'Türziehen',
          ],
        },
        {
          day: 4, focus: 'Beine/Core', method: 'Stufenintervalle',
          exercises: [
            'Einbeinige Kniebeuge im Wechsel (Stuhllehne festhalten)',
            'Seitlicher Ausfallschritt im Wechsel (1–3 Sek.)',
            'Rumänisches Kreuzheben auf einem Bein auf einem Kissen',
            'Beintwist mit gebeugten Knien',
          ],
        },
      ],
    },
    {
      weekLabel: 'Woche 3 und 4',
      weeks: [3, 4],
      phase: 'Kraft',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Intervallsätze',
          exercises: ['Einarmiger Liegestütz (Hand erhöht)', 'Sturzflug', 'Military Press (Füße erhöht)', 'Trizepsdip'],
        },
        {
          day: 2, focus: 'Beine', method: 'Intervallsätze',
          exercises: [
            'Einbeinige Kniebeuge (Stuhllehne oder erhöhte Fläche)',
            'Kniebeuge im Ausfallschritt (4–6 Sek.)',
            'Seitlicher Ausfallschritt (4–6 Sek.)',
            'Hüftstrecker mit einem Bein',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Intervallsätze',
          exercises: [
            'Türklimmzug',
            'Türziehen mit 1–3 Sek. Haltezeit',
            'Umgekehrtes Bankdrücken',
            'Umgekehrtes Bankdrücken im Untergriff',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Intervallsätze',
          exercises: [
            'Hängendes Beinheben (parallel zum Boden)',
            'Rückenheber',
            'V-Up',
            'Superman',
          ],
        },
      ],
    },
    {
      weekLabel: 'Woche 5 und 6',
      weeks: [5, 6],
      phase: 'Power-Block',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Supersätze',
          exercises: [
            'Einarmiger Liegestütz / Federnder Liegestütz',
            'Military Press (Füße erhöht) / Sturzflug',
            'Erhöhter Trizepsstrecker / Liegestütz mit Abstoßen',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Supersätze',
          exercises: [
            'Pistole / Kistensprung',
            'Sissy-Kniebeuge / Iron Mike',
            'Fallender Liegestütz / Seitsprung',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Supersätze',
          exercises: [
            'Türklimmzug / Türziehen',
            'Einarmiges Türziehen / Umgekehrtes Bankdrücken im Untergriff',
            'Türziehen im Untergriff (4–6 Sek.) / Curl mit Handtuch',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersätze',
          exercises: [
            'Hängendes Beinheben / Fahrradfahren',
            'Rückenheber / Superman',
            'V-Up / Beintwist mit gebeugten Knien',
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
          day: 1, focus: 'Drücken', method: 'Stufenintervalle',
          exercises: [
            'Einarmiger Liegestütz (Hände kniehoch erhöht)',
            'Sturzflug',
            'Trizepsdip',
            'Trizepsdip mit Stuhl',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Supersätze',
          exercises: [
            'Pistole / Sissy-Kniebeuge',
            'Kistensprung / Iron Mike',
            'Fallender Liegestütz / Seitsprung',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Intervallsätze',
          exercises: [
            'Türklimmzug',
            'Türziehen (1–3 Sek.)',
            'Umgekehrtes Bankdrücken',
            'Umgekehrtes Bankdrücken im Untergriff',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Hochintensitätssätze',
          exercises: ['Schräger V-Up (4 Sätze pro Seite)', 'Beinscheren-Crunch mit gekreuzten Armen', 'Kniebeuge'],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: [
            '12 einbeinige Kniebeugen im Wechsel (Stuhl) oder Kistensprünge',
            '6 Sturzflüge',
            '8 × Umgekehrtes Bankdrücken',
          ],
        },
      ],
    },
    {
      week: 8,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Hochintensitätssätze',
          exercises: ['Liegestütz', 'Liegestütz mit Abstoßen', 'Kniebeuge'],
        },
        {
          day: 2, focus: 'Beine', method: 'Stufenintervalle',
          exercises: [
            'Einbeinige Kniebeuge (mit Stuhl)',
            'Sissy-Kniebeuge',
            'Seitlicher Ausfallschritt (1–3 Sek.)',
            'Hüftstrecker',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Supersätze',
          exercises: [
            'Türklimmzug / Umgekehrtes Bankdrücken',
            'Einarmiges Türziehen / Umgekehrtes Bankdrücken im Untergriff (Füße erhöht)',
            'Türziehen im Untergriff / Curl mit Handtuch',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Intervallsätze',
          exercises: ['Hängendes Beinheben', 'Rückenheber', 'V-Up', 'Superman'],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: [
            '12 einbeinige Kniebeugen im Wechsel (Stuhl) oder Kistensprünge',
            '6 Sturzflüge',
            '8 × Umgekehrtes Bankdrücken',
          ],
        },
      ],
    },
    {
      week: 9,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Intervallsätze',
          exercises: [
            'Einarmiger Liegestütz (Hände erhöht)',
            'Sturzflug',
            'Military Press (Füße erhöht)',
            'Trizepsdip',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Hochintensitätssätze',
          exercises: ['Iron Mike', 'Seitsprung', 'Kniebeuge'],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Stufenintervalle',
          exercises: [
            'Türklimmzug mit Stuhl',
            'Umgekehrtes Bankdrücken',
            'Umgekehrtes Bankdrücken im Untergriff',
            'Türziehen',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersätze',
          exercises: [
            'Hängendes Beinheben / Fahrradfahren',
            'Rückenheber / Superman',
            'V-Up / Beintwist mit gebeugten Knien',
          ],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: [
            '12 einbeinige Kniebeugen im Wechsel (Stuhl) oder Kistensprünge',
            '6 Sturzflüge',
            '8 × Umgekehrtes Bankdrücken',
          ],
        },
      ],
    },
    {
      week: 10,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Supersätze',
          exercises: [
            'Einarmiger Liegestütz / Federnder Liegestütz',
            'Military Press (Füße erhöht) / Sturzflug',
            'Erhöhter Trizepsstrecker / Liegestütz mit Abstoßen',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Intervallsätze',
          exercises: [
            'Einbeinige Kniebeuge (Stuhllehne)',
            'Kniebeuge im Ausfallschritt (4–6 Sek.)',
            'Seitlicher Ausfallschritt (4–6 Sek.)',
            'Hüftstrecker mit einem Bein',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Hochintensitätssätze',
          exercises: ['Umgekehrtes Bankdrücken', 'Türziehen', 'Kniebeuge'],
        },
        {
          day: 4, focus: 'Core', method: 'Stufenintervalle',
          exercises: [
            'Schräger V-Up mit gebeugten Knien',
            'Fliegende Grätsche',
            'Beinheber mit gekreuzten Armen',
            'Strecken (Hände unter dem Kinn)',
          ],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: [
            '12 einbeinige Kniebeugen im Wechsel (Stuhl) oder Kistensprünge',
            '6 Sturzflüge',
            '8 × Umgekehrtes Bankdrücken',
          ],
        },
      ],
    },
  ],
  totalSessions: 44,
}

// ── Chief Class ───────────────────────────────────────────────────────────────

const CHIEF: FogProgram = {
  id: 'chief',
  name: 'Chief Class',
  subtitle: 'für Spitzensportler',
  requirements: [
    { category: 'Drücken', text: '16 einarmige Liegestütze – 8 pro Seite, Seitenwechsel nach jeder Wiederholung' },
    { category: 'Ziehen', text: '12 Klimmzüge mit je 1 Sek. Haltezeit in höchster und tiefster Position' },
    { category: 'Beine', text: '24 Pistolen im Wechsel – 12 pro Seite, Seitenwechsel nach jeder Wiederholung' },
    { category: 'Core', text: 'Liegestützposition für 5 Minuten halten' },
  ],
  blocks: [
    {
      weekLabel: 'Woche 1 und 2',
      weeks: [1, 2],
      phase: 'Muskuläre Ausdauer',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Drücken/Ziehen', method: 'Stufenintervalle',
          exercises: [
            'Einarmiger Liegestütz im Wechsel (Hand erhöht)',
            'Türklimmzug',
            'Sturzflug',
            'Umgekehrtes Bankdrücken (Füße erhöht)',
          ],
        },
        {
          day: 2, focus: 'Beine/Core', method: 'Stufenintervalle',
          exercises: [
            'Pistole im Wechsel',
            'Iron Mike',
            'Hüftstrecker mit einem Bein im Wechsel',
            'Rückenheber',
          ],
        },
        {
          day: 3, focus: 'Drücken/Ziehen', method: 'Stufenintervalle',
          exercises: [
            'Einarmiger Liegestütz im Wechsel (Hand erhöht)',
            'Türklimmzug',
            'Military Press (Füße erhöht)',
            'Einarmiges Türziehen im Wechsel',
          ],
        },
        {
          day: 4, focus: 'Beine/Core', method: 'Stufenintervalle',
          exercises: ['Einbeinige Kniebeuge im Wechsel', 'Kistensprung', 'Sissy-Kniebeuge', 'Beintwist'],
        },
      ],
    },
    {
      weekLabel: 'Woche 3 und 4',
      weeks: [3, 4],
      phase: 'Kraft',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Intervallsätze',
          exercises: [
            'Einarmiger Liegestütz',
            'Handstandliegestütz',
            'Sturzflug',
            'Erhöhter Trizepsstrecker (hüfthoch)',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Intervallsätze',
          exercises: [
            'Pistole',
            'Kniebeuge im Ausfallschritt (4–6 Sek.)',
            'Sissy-Kniebeuge',
            'Iron Mike',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Intervallsätze',
          exercises: [
            'Türklimmzug (1–3 Sek. Haltezeit oben)',
            'Einarmiges Türziehen',
            'Umgekehrtes Bankdrücken im Untergriff (Füße erhöht)',
            'Türziehen (4–6 Sek.)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Intervallsätze',
          exercises: [
            'Hängendes Beinheben (bis ganz nach oben)',
            'Rückenheber',
            'Klappmesser',
            'Superman',
          ],
        },
      ],
    },
    {
      weekLabel: 'Woche 5 und 6',
      weeks: [5, 6],
      phase: 'Power-Block',
      sessionsPerWeek: 4,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Supersätze',
          exercises: [
            'Einarmiger Liegestütz (Füße erhöht) / Federnder Liegestütz',
            'Handstandliegestütz (1–3 Sek.) / Sturzflug',
            'Erhöhter Trizepsstrecker (hüfthoch) / Liegestütz mit Abstoßen',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Supersätze',
          exercises: [
            'Pistole im Wechsel (1–3 Sek.) / Kistensprung',
            'Sissy-Kniebeuge (1–3 Sek.) / Iron Mike',
            'Fallender Liegestütz / Seitsprung',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Supersätze',
          exercises: [
            'Türklimmzug (4–6 Sek.) / Umgekehrtes Bankdrücken (Füße erhöht)',
            'Einarmiges Türziehen (1–3 Sek.) / Umgekehrtes Bankdrücken im Untergriff (Füße erhöht)',
            'Klimmzug (bis zum Brustbein) / Türziehen im Untergriff (4–6 Sek.)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersätze',
          exercises: [
            'Hängendes Beinheben (4–6 Sek.) / Langsames Fahrradfahren',
            'Rückenheber / Superman',
            'Klappmesser / Beintwist',
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
          day: 1, focus: 'Drücken', method: 'Stufenintervalle',
          exercises: [
            'Einarmiger Liegestütz',
            'Handstandliegestütz',
            'Sturzflug',
            'Trizepsdip (1–3 Sek.)',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Supersätze',
          exercises: [
            'Pistole im Wechsel (1–3 Sek.) / Kistensprung',
            'Sissy-Kniebeuge (1–3 Sek.) / Iron Mike',
            'Fallender Liegestütz (ohne Hände) / Seitsprung',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Intervallsätze',
          exercises: [
            'Türklimmzug (1–3 Sek.)',
            'Einarmiges Türziehen',
            'Umgekehrtes Bankdrücken im Untergriff (Füße erhöht)',
            'Türziehen im Untergriff (4–6 Sek.)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Hochintensitätssätze',
          exercises: ['V-Up', 'Schräger V-Up (4 Sätze, Seitenwechsel)', 'Bergsteiger', 'Kniebeuge'],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: [
            '12 Pistolen im Wechsel (6/Seite) oder 24 Iron Mikes',
            '6 Handstandliegestütze',
            '8 Türklimmzüge',
          ],
        },
      ],
    },
    {
      week: 8,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Hochintensitätssätze',
          exercises: ['Liegestütz', 'Liegestütz mit Abstoßen', 'Bergsteiger', 'Doppelter Liegestützsprung (Burpee)'],
        },
        {
          day: 2, focus: 'Beine', method: 'Stufenintervalle',
          exercises: ['Einbeinige Kniebeuge', 'Sissy-Kniebeuge', 'Iron Mike', 'Einbeiniger Hüftstrecker'],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Supersätze',
          exercises: [
            'Türklimmzug (4–6 Sek.) / Umgekehrtes Bankdrücken (Füße erhöht)',
            'Einarmiges Türziehen (1–3 Sek.) / Umgekehrtes Bankdrücken im Untergriff (Füße erhöht)',
            'Klimmzug (bis Brustbein) / Türziehen im Untergriff (4–6 Sek.)',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Intervallsätze',
          exercises: [
            'Hängendes Beinheben (bis ganz nach oben)',
            'Rückenheber',
            'Klappmesser',
            'Superman',
          ],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: [
            '12 Pistolen im Wechsel (6/Seite) oder 24 Iron Mikes',
            '6 Handstandliegestütze',
            '8 Türklimmzüge',
          ],
        },
      ],
    },
    {
      week: 9,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Intervallsätze',
          exercises: [
            'Einarmiger Liegestütz',
            'Handstandliegestütz',
            'Sturzflug',
            'Erhöhter Trizepsstrecker (hüfthoch)',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Hochintensitätssätze',
          exercises: ['Iron Mike', 'Seitsprung', 'Gestreckte Kniebeuge', 'Kniebeuge'],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Stufenintervalle',
          exercises: [
            'Türklimmzug',
            'Umgekehrtes Bankdrücken',
            'Umgekehrtes Bankdrücken im Untergriff',
            'Einarmiges Türziehen im Wechsel',
          ],
        },
        {
          day: 4, focus: 'Core', method: 'Supersätze',
          exercises: [
            'Hängendes Beinheben (4–6 Sek.) / Langsames Fahrradfahren (24 ×)',
            'Rückenheber / Superman',
            'Klappmesser / Beintwist (12 × langsam)',
          ],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: [
            '12 Pistolen im Wechsel (6/Seite) oder 24 Iron Mikes',
            '6 Handstandliegestütze',
            '8 Türklimmzüge',
          ],
        },
      ],
    },
    {
      week: 10,
      days: [
        {
          day: 1, focus: 'Drücken', method: 'Supersätze',
          exercises: [
            'Einarmiger Liegestütz (Füße erhöht) / Federnder Liegestütz',
            'Handstandliegestütz / Sturzflug (mit Haltezeit)',
            'Erhöhter Trizepsstrecker (kniehoch) / Liegestütz mit Abstoßen',
          ],
        },
        {
          day: 2, focus: 'Beine', method: 'Intervallsätze',
          exercises: [
            'Einbeinige Kniebeuge',
            'Kniebeuge im Ausfallschritt (Rucksack über Kopf)',
            'Iron Mike',
            'Fallender Liegestütz',
          ],
        },
        {
          day: 3, focus: 'Ziehen', method: 'Hochintensitätssätze',
          exercises: ['Türklimmzug', 'Umgekehrtes Bankdrücken', 'Türziehen', 'Bergsteiger'],
        },
        {
          day: 4, focus: 'Core', method: 'Stufenintervalle',
          exercises: [
            'Klappmesser',
            'Rückenheber',
            'Schräger V-Up im Wechsel (Beine gestreckt)',
            'Superman',
          ],
        },
        {
          day: 5, focus: 'Ganzkörper', method: 'Zirkelintervalle',
          exercises: [
            '12 Pistolen im Wechsel (6/Seite) oder 24 Iron Mikes',
            '6 Handstandliegestütze',
            '8 Türklimmzüge',
          ],
        },
      ],
    },
  ],
  totalSessions: 44,
}

export const FOG_PROGRAMS: FogProgram[] = [BEGINNER, FIRST, MASTER, CHIEF]
