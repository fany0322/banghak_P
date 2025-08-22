// FILE: stores/eventsStore.ts
import { create } from 'zustand';
import { apiService } from '@/services/api';

export const COLORS = ['#ff3b30', '#007aff', '#34c759', '#ff9500', '#af52de'] as const
export type EventItem = { text: string; color: string; id?: number }
export type Events = Record<string, EventItem[]>

type ServerEvent = { id: number; title: string; due_date: string; description?: string }

type State = {
  events: Events
  marked: Record<string, any>
  selectedDate: string | null
  isLoading: boolean
  setSelectedDate: (d: string | null) => void
  addEvent: (date: string, text: string, color?: string) => Promise<void>
  deleteEvent: (date: string, eventId: number) => Promise<void>
  changeEventColor: (date: string, idx: number, color: string) => void
  loadEventsFromServer: () => Promise<void>
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
  isLoading: false,
  setSelectedDate: (d) => set({ selectedDate: d }),

  addEvent: async (date, text, color = COLORS[0]) => {
    try {
      set({ isLoading: true });
      
      // 서버에 이벤트 저장
      const result = await apiService.createCalendarEvent({
        title: text,
        date: date,
        description: `캘린더 일정: ${text}`
      });

      // 로컬 스토어 업데이트
      const { events } = get();
      const list = [...(events[date] || []), { text, color, id: result.id }];
      const next = { ...events, [date]: list };
      set(s => ({ 
        events: next, 
        marked: { ...s.marked, [date]: buildMarked(list) },
        isLoading: false 
      }));
    } catch (error) {
      console.error('Failed to add event:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (date, eventId) => {
    try {
      set({ isLoading: true });
      
      // 서버에서 이벤트 삭제
      await apiService.deleteCalendarEvent(eventId);

      // 로컬 스토어 업데이트
      const { events } = get();
      const list = (events[date] || []).filter(e => e.id !== eventId);
      const next = { ...events, [date]: list };
      set(s => ({ 
        events: next, 
        marked: { ...s.marked, [date]: buildMarked(list) },
        isLoading: false 
      }));
    } catch (error) {
      console.error('Failed to delete event:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  changeEventColor: (date, idx, color) => {
    const { events } = get()
    const list = [...(events[date] || [])]
    if (!list[idx]) return
    list[idx] = { ...list[idx], color }
    const next = { ...events, [date]: list }
    set(s => ({ events: next, marked: { ...s.marked, [date]: buildMarked(list) } }))
  },

  loadEventsFromServer: async () => {
    try {
      set({ isLoading: true });
      const serverEvents = await apiService.getCalendarEvents();
      get().bulkImportFromServer(serverEvents);
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to load events from server:', error);
      set({ isLoading: false });
    }
  },

  bulkImportFromServer: (server) => {
    // 서버의 Assignment를 캘린더 이벤트로 변환
    const grouped: Events = {}
    const colorPicker = (key: string, i: number) => COLORS[(Math.abs(hash(key ?? "" ) + i)) % COLORS.length]

    server.forEach(se => {
      // due_date에서 날짜 부분만 추출 (YYYY-MM-DD)
      const key = se.due_date.split('T')[0]
      const arr = grouped[key] || []
      arr.push({ 
        text: se.title, 
        color: colorPicker(se.id.toString(), arr.length),
        id: se.id 
      })
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
