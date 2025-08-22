// FILE: app/(tabs)/calendar.tsx
import { COLORS, useEventsStore } from '@/stores/eventsStore'
import { useMemo, useState, useEffect } from 'react'
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native'
import { Calendar } from 'react-native-calendars'
import Modal from 'react-native-modal'

const PASTEL_BLUE = '#E8F1FF'
const ACCENT_BLUE = '#5AA9FF'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function CalendarTab() {
  const { 
    events, 
    marked, 
    selectedDate, 
    isLoading, 
    setSelectedDate, 
    addEvent, 
    deleteEvent, 
    changeEventColor, 
    loadEventsFromServer 
  } = useEventsStore()
  
  const [isModalVisible, setModalVisible] = useState(false)
  const [input, setInput] = useState('')
  const [selectedColor, setSelectedColor] = useState<typeof COLORS[number]>(COLORS[0])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const today = useMemo(() => todayISO(), [])

  // 컴포넌트 마운트 시 서버에서 이벤트 로드
  useEffect(() => {
    loadEventsFromServer()
  }, [loadEventsFromServer])

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString)
    setModalVisible(true)
    setEditingIndex(null)
  }

  const onAdd = async () => {
    if (!selectedDate || !input.trim()) return
    
    try {
      await addEvent(selectedDate, input.trim(), selectedColor)
      setInput('')
      setSelectedColor(COLORS[0])
      setEditingIndex(null)
      setModalVisible(false)
    } catch (error) {
      Alert.alert('오류', '일정 추가에 실패했습니다.')
    }
  }

  const onDeleteEvent = async (eventId: number) => {
    if (!selectedDate) return
    
    Alert.alert(
      '삭제 확인',
      '이 일정을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(selectedDate, eventId)
            } catch (error) {
              Alert.alert('오류', '일정 삭제에 실패했습니다.')
            }
          }
        }
      ]
    )
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
          }}
          current={selectedDate ?? undefined}
        />
      </View>

      <View style={s.todayBox}>
        <Text style={s.todayTitle}>오늘 일정</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color={ACCENT_BLUE} style={{ marginTop: 20 }} />
        ) : todayEvents.length ? (
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

      <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)} style={s.modal}>
        <View style={s.sheet}>
          <Text style={s.sheetTitle}>📅 {selectedDate || '날짜 선택'} 일정 추가</Text>
          <TextInput
            style={s.input}
            placeholder="일정을 입력하세요"
            value={input}
            onChangeText={setInput}
            returnKeyType="done"
            onSubmitEditing={onAdd}
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
          <TouchableOpacity style={s.addBtn} onPress={onAdd} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.addBtnText}>추가하기</Text>
            )}
          </TouchableOpacity>

          {!!(selectedDate && events[selectedDate]?.length) && (
            <View style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6 }}>저장된 일정</Text>
              {events[selectedDate]!.map((e, i) => (
                <View key={i} style={s.savedRow}>
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                    onPress={() => setEditingIndex(i)}
                  >
                    <View style={[s.dot, { backgroundColor: e.color }]} />
                    <Text style={s.savedText}>• {e.text}</Text>
                    {editingIndex === i && <Text style={s.editBadge}>편집중</Text>}
                  </TouchableOpacity>
                  {e.id && (
                    <TouchableOpacity 
                      style={s.deleteBtn}
                      onPress={() => onDeleteEvent(e.id!)}
                    >
                      <Text style={s.deleteBtnText}>삭제</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {editingIndex !== null && (
                <View style={{ marginTop: 10 }}>
                  <Text style={s.colorLabel}>선택한 일정의 색상 변경</Text>
                  <View style={s.colorRow}>
                    {COLORS.map(color => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => selectedDate && changeEventColor(selectedDate, editingIndex, color)}
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
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  calendarWrap: { 
    backgroundColor: '#ffffff',
    marginHorizontal: 16, 
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingTop: 16,
    paddingBottom: 12
  },
  calendar: { 
    height: 380, 
    width: '100%', 
    alignSelf: 'stretch', 
    backgroundColor: 'transparent', 
    borderRadius: 16
  },
  todayBox: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  todayTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 16,
    color: '#1e293b'
  },
  todayEmpty: { 
    color: '#64748b',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20
  },
  eventRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6'
  },
  dot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    marginRight: 12
  },
  eventText: { 
    fontSize: 16,
    color: '#374151',
    fontWeight: '500'
  },
  separator: { 
    height: 1, 
    backgroundColor: '#e5e7eb',
    marginVertical: 4
  },
  modal: { 
    justifyContent: 'flex-end', 
    margin: 0 
  },
  sheet: { 
    backgroundColor: 'white', 
    padding: 24, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24,
    minHeight: 300
  },
  sheetTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 20,
    color: '#1e293b',
    textAlign: 'center'
  },
  input: { 
    borderWidth: 2, 
    borderColor: '#e5e7eb', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    height: 48, 
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc'
  },
  colorLabel: { 
    fontWeight: '600', 
    marginBottom: 12,
    fontSize: 16,
    color: '#374151'
  },
  colorRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20
  },
  colorBox: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    borderColor: '#d1d5db',
    borderWidth: 2
  },
  addBtn: { 
    backgroundColor: '#3b82f6', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  addBtnText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16 
  },
  savedRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
    borderRadius: 12
  },
  savedText: { 
    fontSize: 16, 
    flexShrink: 1,
    color: '#374151',
    fontWeight: '500'
  },
  editBadge: { 
    marginLeft: 12, 
    fontSize: 12, 
    color: '#fff', 
    backgroundColor: '#6366f1', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8,
    fontWeight: '600'
  },
  deleteBtn: { 
    backgroundColor: '#ef4444', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    marginLeft: 12
  },
  deleteBtnText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '600' 
  },
})
