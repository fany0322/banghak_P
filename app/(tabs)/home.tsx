import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const schedule = [
  { time: '08:40', subject: '수학' },
  { time: '09:40', subject: '문학' },
  { time: '10:40', subject: '영어' },
  { time: '11:40', subject: '통사' },
  { time: '13:30', subject: '시디' },
  { time: '14:30', subject: '시디' },
  { time: '15:30', subject: '국사' }
];

const events = [
  { date: '7월 24일', dday: 'D-day', title: '영어 수행평가 (말하기)' },
  { date: '7월 25일', dday: 'D-1', title: '영어 수행평가 (쓰기)' },
  { date: '8월 1일',  dday: 'D-8',  title: '수행평가 말 줄이기 훈련' }
];

export default function Home() {
  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={s.header}>환영합니다 000님</Text>

        <View style={s.card}>
          <Text style={s.sectionTitle}>📘 오늘 시간표</Text>
          {schedule.map((row, i) => (
            <View key={i} style={s.row}>
              <Text style={s.time}>{row.time}</Text>
              <Text style={s.subject}>{row.subject}</Text>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>📅 예정된 일정</Text>
          {events.map((e, i) => (
            <View key={i} style={s.eventRow}>
              <Text style={s.eventDate}>{e.date}</Text>
              <Text style={s.dday}>{e.dday}</Text>
              <Text style={s.eventTitle}>{e.title}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { fontSize: 24, fontWeight: 'bold', marginTop: 24, marginBottom: 16, paddingHorizontal: 20 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  time: { width: 64, fontWeight: '600', color: '#333' },
  subject: { flex: 1, fontSize: 16, color: '#444' },
  eventRow: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  eventDate: { fontSize: 15, fontWeight: '600' },
  dday: { position: 'absolute', right: 0, top: 8, color: '#d22', fontWeight: '700' },
  eventTitle: { marginTop: 4, color: '#555' },
});
