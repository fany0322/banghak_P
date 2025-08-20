// FILE: app/(tabs)/index.tsx (Home)
import { useEventsStore } from '@/stores/eventsStore'; // 전역 스토어 (캘린더 연동)
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

// ====== 타입 & 서버 모킹 ======
type ServerEvent = { id: string; title: string; dateISO: string };

async function fetchUpcomingEventsFromServer(): Promise<ServerEvent[]> {
  // 네트워크 지연 흉내
  await new Promise((r) => setTimeout(r, 300));
  // 서버에서 ISO 날짜로 내려온다고 가정
  return [
    { id: 'e1', title: '영어 수행평가 (말하기)', dateISO: '2025-07-24' },
    { id: 'e2', title: '영어 수행평가 (쓰기)', dateISO: '2025-07-25' },
    { id: 'e3', title: '엄청나게 긴 이름의 수행평가를 적으면 말을 줄이기 (말을 줄이기)', dateISO: '2025-08-01' },
    { id: 'e4', title: '동아리 발표', dateISO: '2025-07-30' },
    { id: 'e5', title: '모의고사', dateISO: '2025-07-27' },
  ];
}

// ====== 유틸 ======
function toDisplayMD(dateISO: string) {
  const d = new Date(dateISO);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
function ddayLabel(dateISO: string) {
  const MS = 24 * 60 * 60 * 1000;
  const today = new Date();
  const target = new Date(dateISO);
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const t1 = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diff = Math.round((t1 - t0) / MS);
  if (diff === 0) return 'D-day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}
function monthKey(dateISO: string) {
  const d = new Date(dateISO);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // ex) 2025-07
}
function isSameOrAfterToday(dateISO: string) {
  const today = new Date();
  const target = new Date(dateISO);
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return b >= a;
}

// ====== 오늘의 시간표 더미 ======
const todaySchedule = [
  { time: '08:40', subject: '수학' },
  { time: '09:40', subject: '문학' },
  { time: '10:40', subject: '영어' },
  { time: '11:40', subject: '통사' },
  { time: '13:30', subject: '시디' },
  { time: '14:30', subject: '시디' },
  { time: '15:30', subject: '국사' },
];

// ====== 인기 게시물 더미 ======
const popularPosts = [
  { id: 'p1', title: '글제목제목', excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed ㅁㅇㄹdo eiu..ㅁㄴㅇㄻㄴㄹㄴㅁㄻㄴ.', minutesAgo: 1, comments: 0, likes: 9, thumbnail: null },
  { id: 'p2', title: '글제목제목', excerpt: '짧은 요약문이 들어갑니다...', minutesAgo: 5, comments: 3, likes: 12, thumbnail: null },
  { id: 'p3', title: '글제목제목', excerpt: '다른 게시물 요약...', minutesAgo: 22, comments: 1, likes: 4, thumbnail: null },
];

export default function Home() {
  const router = useRouter();
  const { bulkImportFromServer, setSelectedDate } = useEventsStore(); // 캘린더 연동

  // Home 카드 전용 상태
  const [events, setEvents] = useState<ServerEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  // “예정된 일정 >” 클릭 시 서버에서 로드 + 스토어 동기화
  const handleOpenUpcoming = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUpcomingEventsFromServer();
      const upcoming = data
        .filter((e) => isSameOrAfterToday(e.dateISO))
        .sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));

      setEvents(upcoming);

      // 전역 스토어(캘린더)에 입력
      bulkImportFromServer(upcoming);
      if (upcoming[0]) setSelectedDate(upcoming[0].dateISO);

      setExpandedMonth(null); // 기본은 3개 모드
    } finally {
      setLoading(false);
    }
  }, [bulkImportFromServer, setSelectedDate]);

  // 파생 리스트
  const top3 = useMemo(() => (events ? events.slice(0, 3) : []), [events]);
  const monthAll = useMemo(() => {
    if (!events?.length) return [] as ServerEvent[];
    const key = expandedMonth ?? monthKey(events[0].dateISO);
    return events.filter((e) => monthKey(e.dateISO) === key);
  }, [events, expandedMonth]);
  const eventList = expandedMonth === null ? top3 : monthAll;

  return (
    <SafeAreaView style={styles.rootContainer}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 환영 메시지 */}
        <Text style={styles.welcomeText}>환영합니다 000님</Text>

        {/* 오늘의 시간표 카드 */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.classInfoText}>2학년 10반</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="book" size={20} color="#3B82F6" style={{ marginRight: 4 }} />
              <Text style={styles.scheduleTitle}>오늘 시간표 &gt;</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodsRow}>
            {todaySchedule.map((row, i) => (
              <View key={i} style={styles.periodItem}>
                <Text style={styles.periodTime}>{row.time}</Text>
                <Text style={styles.periodSubject}>{row.subject}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 예정된 일정 카드 */}
        <View style={styles.eventCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="calendar" size={20} color="#FFB300" style={{ marginRight: 4 }} />
            {/* 헤더를 누르면 서버에서 최신 일정 로드 */}
            <Pressable onPress={handleOpenUpcoming}>
              <Text style={styles.eventTitleRow}>예정된 일정 &gt;</Text>
            </Pressable>
          </View>

          {/* 로딩 표시 */}
          {loading && (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator />
            </View>
          )}

          {/* 아직 로드 전: 초기 더미(디자인 유지) */}
          {!loading && !events && (
            <>
              {[
                { dateISO: '2025-07-24', title: '영어 수행평가 (말하기)' },
                { dateISO: '2025-07-25', title: '영어 수행평가 (쓰기)' },
                { dateISO: '2025-08-01', title: '엄청나게 긴 이름의 수행평가를 적으면 말을 줄이기 (말을 줄이기)' },
              ].map((e, i) => {
                const isFirst = i === 0;
                return (
                  <View key={i} style={[styles.eventItem, !isFirst && styles.eventItemDivider, isFirst && styles.eventHighlight]}>
                    <View style={styles.eventItemHeader}>
                      <Text style={styles.eventDateText}>{toDisplayMD(e.dateISO)}</Text>
                      <Text style={styles.eventDdayText}>{ddayLabel(e.dateISO)}</Text>
                    </View>
                    <Text style={[styles.eventNameText, isFirst && styles.eventNameHighlight]} numberOfLines={1} ellipsizeMode="tail">
                      {e.title}
                    </Text>
                  </View>
                );
              })}
              <Text style={styles.eventMoreDots}>···</Text>
            </>
          )}

          {/* 서버 데이터 렌더 */}
          {!loading && events && (
            <>
              {eventList.map((e, i) => {
                const isFirst = i === 0 && expandedMonth === null; // 접힘 모드: 첫 줄 강조
                return (
                  <View key={e.id} style={[styles.eventItem, i !== 0 && styles.eventItemDivider, isFirst && styles.eventHighlight]}>
                    <View style={styles.eventItemHeader}>
                      <Text style={styles.eventDateText}>{toDisplayMD(e.dateISO)}</Text>
                      <Text style={styles.eventDdayText}>{ddayLabel(e.dateISO)}</Text>
                    </View>
                    <Text style={[styles.eventNameText, isFirst && styles.eventNameHighlight]} numberOfLines={1} ellipsizeMode="tail">
                      {e.title}
                    </Text>
                  </View>
                );
              })}

              {/* 접힘 → 같은 달 전체 / 펼침 → 닫기 */}
              {events.length > 3 && (
                <Pressable onPress={() => setExpandedMonth(expandedMonth === null ? monthKey(events[0].dateISO) : null)}>
                  <Text style={styles.eventMoreDots}>{expandedMonth === null ? '···' : '닫기'}</Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* 인기 게시물 카드 */}
        <View style={styles.popularCard}>
          <View style={styles.popularHeaderRow}>
            <Ionicons name="flame-outline" size={18} color="#111" style={{ marginRight: 6 }} />
            <Pressable onPress={() => router.push('/popular')}>
              <Text style={styles.popularHeaderText}>인기 게시물 &gt;</Text>
            </Pressable>
          </View>

          {popularPosts.map((post, i) => (
            <Pressable
              key={post.id}
              onPress={() => router.push({ pathname: '/popular/[postId]', params: { postId: post.id }, })}
              style={[styles.popularItemRow, i !== 0 && styles.popularItemDivider]}
            > 
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.popularTitleText} numberOfLines={1}>{post.title}</Text>
                <Text style={styles.popularExcerptText} numberOfLines={2}>{post.excerpt}</Text>
                <View style={styles.popularMetaRow}>
                  <Text style={styles.popularTimeText}>{post.minutesAgo}분 전</Text>
                  <View style={styles.popularMetaIcons}>
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color="#3B82F6" />
                    <Text style={styles.popularMetaNum}>{post.comments}</Text>
                    <Ionicons name="thumbs-up-outline" size={14} color="#FF4830" style={{ marginLeft: 10 }} />
                    <Text style={styles.popularMetaNum}>{post.likes}</Text>
                  </View>
                </View>
              </View>
              {post.thumbnail ? (
                <Image source={{ uri: post.thumbnail }} style={styles.popularThumbImage} />
              ) : (
                <View style={styles.popularThumbPlaceholder} />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ====== 스타일 ======
const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  welcomeText: { fontSize: 24, fontWeight: 'bold', marginTop: 24, marginBottom: 16, paddingHorizontal: 20 },

  eventCard: {
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
  scheduleCard: {
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
  popularCard: {
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

  scheduleHeader: { marginBottom: 8 },
  classInfoText: { fontSize: 13, color: '#000', opacity: 0.7 },
  scheduleTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },

  periodsRow: { paddingTop: 6, paddingBottom: 2 },
  periodItem: { alignItems: 'center', marginRight: 12 },
  periodTime: { fontWeight: '500', color: '#000000CC' },
  periodSubject: { fontSize: 14, color: '#101010' },

  eventTitleRow: { fontSize: 18, fontWeight: '500' },
  eventItem: { paddingVertical: 14, borderRadius: 12, paddingHorizontal: 12 },
  eventItemDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee', marginTop: 8 },
  eventHighlight: { backgroundColor: '#FFEDEA' },
  eventItemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventDateText: { fontSize: 18, fontWeight: '500' },
  eventDdayText: { color: '#FF4830', fontWeight: '600' },
  eventNameText: { fontSize: 18, fontWeight: '500' },
  eventNameHighlight: { color: '#333' },
  eventMoreDots: { textAlign: 'center', color: '#101010', marginTop: 6, fontSize: 18, fontWeight: '500' },

  popularHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  popularHeaderText: { fontSize: 18, fontWeight: '500' },
  popularItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  popularItemDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  popularTitleText: { fontSize: 18, fontWeight: '600', color: '#111' },
  popularExcerptText: { marginTop: 6, fontSize: 15, lineHeight: 20, color: '#555' },
  popularMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  popularTimeText: { fontSize: 13, color: '#666', marginRight: 8 },
  popularMetaIcons: { flexDirection: 'row', alignItems: 'center', marginLeft: 6 },
  popularMetaNum: { fontSize: 13, color: '#444', marginLeft: 4 },
  popularThumbImage: { width: 64, height: 88, borderRadius: 14 },
  popularThumbPlaceholder: { width: 64, height: 88, borderRadius: 14, backgroundColor: '#D9B15E' },
});
