import { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { Calendar } from 'react-native-calendars'

export default function CalendarTab() {
  const [selected, setSelected] = useState('')

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelected(day.dateString)}
        markedDates={{
          '2025-08-19': { selected: true, marked: true, selectedColor: '#ff3b30' },
          '2025-08-25': { marked: true, dotColor: 'blue' },
          '2025-08-26': { marked: true, dotColor: 'blue' },
        }}
        theme={{
          textDayFontSize: 22,          // 날짜 크기 키움
          textMonthFontSize: 26,        // 상단 월 표시 크게
          textDayHeaderFontSize: 18,    // 요일 글씨 크게
          todayTextColor: '#ff3b30',
          selectedDayBackgroundColor: '#ff3b30',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#000',           // 화살표 색
        }}
        style={styles.calendar}
      />
      {selected ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>선택한 날짜: {selected}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  calendar: {
    flex: 0,
    width: '100%',
    height: 400,   // 달력 전체 높이 크게 설정
  },
  infoBox: {
    padding: 15,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
  },
})
