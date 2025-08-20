import { useMemo, useState } from 'react'
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Calendar } from 'react-native-calendars'
import Modal from 'react-native-modal'

const PASTEL_BLUE = '#E8F1FF'
const ACCENT_BLUE = '#5AA9FF'
const COLORS = ['#ff3b30', '#007aff', '#34c759', '#ff9500', '#af52de']

type EventItem = { text: string; color: string }
type Events = Record<string, EventItem[]>

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function CalendarTab() {
  const [selected, setSelected] = useState<string>('')
  const [events, setEvents] = useState<Events>({})
  const [marked, setMarked] = useState<Record<string, any>>({})
  const [isModalVisible, setModalVisible] = useState(false)
  const [input, setInput] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const today = useMemo(() => todayISO(), [])

  const onDayPress = (day: { dateString: string }) => {
    setSelected(day.dateString)
    setModalVisible(true)
    setEditingIndex(null)
  }

  const refreshMarkedFor = (date: string, list: EventItem[]) => {
    setMarked(prev => ({
      ...prev,
      [date]: {
        marked: list.length > 0,
        dots: list.map(e => ({ color: e.color })),
        selected: true,
        selectedColor: '#f2f2f7',
      },
    }))
  }

  const addEvent = () => {
    if (!selected || !input.trim()) return
    const list = [...(events[selected] || []), { text: input.trim(), color: selectedColor }]
    const newEvents: Events = { ...events, [selected]: list }
    setEvents(newEvents)
    refreshMarkedFor(selected, list)
    setInput('')
    setSelectedColor(COLORS[0])
    setEditingIndex(null)
    setModalVisible(false)
  }

  const changeEventColor = (idx: number, color: string) => {
    if (!selected) return
    const list = [...(events[selected] || [])]
    if (!list[idx]) return
    list[idx] = { ...list[idx], color }
    const newEvents = { ...events, [selected]: list }
    setEvents(newEvents)
    refreshMarkedFor(selected, list)
  }

  const todayEvents = events[today] || []

  return (
    <SafeAreaView style={s.container}>
      <View style={s.calendarWrap}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={marked}
          markingType="multi-dot"
          style={s.calendar}
          theme={{
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: ACCENT_BLUE,
            monthTextColor: '#111',
            textMonthFontSize: 24,
            textDayHeaderFontSize: 16,
            textDayFontSize: 20,
            todayTextColor: '#ff3b30',
            selectedDayBackgroundColor: ACCENT_BLUE,
            selectedDayTextColor: '#fff',
            arrowColor: '#111',
            'stylesheet.calendar.main': {
              monthView: { paddingHorizontal: 12, paddingBottom: 12 },
            },
          }}
        />
      </View>

      {/* 오늘 일정만 표시 (선택한 날짜 텍스트 없음) */}
      <View style={s.todayBox}>
        <Text style={s.todayTitle}>오늘 일정</Text>
        {todayEvents.length ? (
          <FlatList
            data={todayEvents}
            keyExtractor={(_, i) => `${today}-${i}`}
            renderItem={({ item }) => (
              <View style={s.eventRow}>
                <View style={[s.dot, { backgroundColor: item.color }]} />
                <Text style={s.eventText}>{item.text}</Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={s.separator} />}
          />
        ) : (
          <Text style={s.todayEmpty}>등록된 일정이 없어요</Text>
        )}
      </View>

      {/* 모달 그대로 */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={s.modal}
      >
        <View style={s.sheet}>
          <Text style={s.sheetTitle}>📅 {selected || '날짜 선택'} 일정 추가</Text>

          <TextInput
            style={s.input}
            placeholder="일정을 입력하세요"
            value={input}
            onChangeText={setInput}
            returnKeyType="done"
            onSubmitEditing={addEvent}
          />

          <Text style={s.colorLabel}>색상 선택</Text>
          <View style={s.colorRow}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  s.colorBox,
                  { backgroundColor: color, borderWidth: selectedColor === color ? 3 : 1 },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={s.addBtn} onPress={addEvent}>
            <Text style={s.addBtnText}>추가하기</Text>
          </TouchableOpacity>

          {!!events[selected]?.length && (
            <View style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6 }}>저장된 일정</Text>
              {events[selected]!.map((e, i) => (
                <TouchableOpacity key={i} style={s.savedRow} onPress={() => setEditingIndex(i)}>
                  <View style={[s.dot, { backgroundColor: e.color }]} />
                  <Text style={s.savedText}>• {e.text}</Text>
                  {editingIndex === i && <Text style={s.editBadge}>편집중</Text>}
                </TouchableOpacity>
              ))}

              {editingIndex !== null && (
                <View style={{ marginTop: 10 }}>
                  <Text style={s.colorLabel}>선택한 일정의 색상 변경</Text>
                  <View style={s.colorRow}>
                    {COLORS.map(color => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => changeEventColor(editingIndex, color)}
                        style={[s.colorBox, { backgroundColor: color, borderWidth: 2 }]}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  calendarWrap: { backgroundColor: PASTEL_BLUE, paddingTop: 8, paddingBottom: 6 },
  calendar: {
    height: 420,
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  todayBox: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  todayTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  todayEmpty: { color: '#8e8e93' },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  eventText: { fontSize: 16 },
  separator: { height: 1, backgroundColor: '#eee' },
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: { backgroundColor: 'white', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, height: 42, marginBottom: 12 },
  colorLabel: { fontWeight: '600', marginBottom: 8 },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  colorBox: { width: 40, height: 40, borderRadius: 20, borderColor: '#000' },
  addBtn: { backgroundColor: ACCENT_BLUE, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  savedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  savedText: { fontSize: 16, flexShrink: 1 },
  editBadge: { marginLeft: 8, fontSize: 12, color: '#fff', backgroundColor: '#111', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
})
