// FILE: stores/eventsStore.ts
import { create } from 'zustand';

export const COLORS = ['#ff3b30', '#007aff', '#34c759', '#ff9500', '#af52de'] as const
export type EventItem = { text: string; color: string }
export type Events = Record<string, EventItem[]>

type ServerEvent = { id: string; title: string; dateISO: string }

type State = {
  events: Events
  marked: Record<string, any>
  selectedDate: string | null
  setSelectedDate: (d: string | null) => void
  addEvent: (date: string, text: string, color?: string) => void
  changeEventColor: (date: string, idx: number, color: string) => void
  bulkImportFromServer: (list: ServerEvent[]) => void
  clear: () => void
}

function buildMarked(list: EventItem[]) {
  return {
    marked: list.length > 0,
    dots: list.map(e => ({ color: e.color })),
    selected: true,
    selectedColor: '#f2f2f7',
  } 
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return h | 0
}

export const useEventsStore = create<State>((set, get) => ({
  events: {},
  marked: {},
  selectedDate: null,
  setSelectedDate: (d) => set({ selectedDate: d }),

  addEvent: (date, text, color = COLORS[0]) => {
    const { events } = get()
    const list = [...(events[date] || []), { text, color }]
    const next = { ...events, [date]: list }
    set(s => ({ events: next, marked: { ...s.marked, [date]: buildMarked(list) } }))
  },

  changeEventColor: (date, idx, color) => {
    const { events } = get()
    const list = [...(events[date] || [])]
    if (!list[idx]) return
    list[idx] = { ...list[idx], color }
    const next = { ...events, [date]: list }
    set(s => ({ events: next, marked: { ...s.marked, [date]: buildMarked(list) } }))
  },

  bulkImportFromServer: (server) => {
    // 같은 날짜에 여러 건 → 색상은 일정별로 순환 지정(결정적)
    const grouped: Events = {}
    const colorPicker = (key: string, i: number) => COLORS[(Math.abs(hash(key ?? "" ) + i)) % COLORS.length]

    server.forEach(se => {
      const key = se.dateISO
      const arr = grouped[key] || []
      arr.push({ text: se.title, color: colorPicker(se.id || se.title, arr.length) })
      grouped[key] = arr
    })

    const marked: Record<string, any> = {}
    Object.entries(grouped).forEach(([date, list]) => {
      marked[date] = buildMarked(list)
    })

    set({ events: grouped, marked })
  },

  clear: () => set({ events: {}, marked: {}, selectedDate: null }),
}))
