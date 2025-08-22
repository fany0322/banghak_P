// FILE: app/(tabs)/index.tsx (Home)
import { useEventsStore } from '@/stores/eventsStore'; // 전역 스토어 (캘린더 연동)
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { useFocusEffect } from 'expo-router';

// ====== 타입 정의 ======
type EventItem = {
  id: string;
  title: string;
  dateISO: string;
};

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

// ====== 시간대 매핑 ======
const periodTimes = [
  '08:40', '09:40', '10:40', '11:40', 
  '13:30', '14:30', '15:30'
];

// ====== 인기 게시물 타입 ======
type PopularPost = {
  id: number;
  title: string;
  excerpt: string;
  minutesAgo: number;
  comments: number;
  likes: number;
  thumbnail: string | null;
  category: string;
};

export default function Home() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { 
    events: calendarEvents, 
    bulkImportFromServer, 
    setSelectedDate, 
    loadEventsFromServer 
  } = useEventsStore(); // 캘린더 연동

  // 카테고리를 boardId로 매핑하는 함수
  const getCategoryBoardId = (category: string): string => {
    switch (category) {
      case 'general': return 'free';
      case 'question': return 'qna';
      case 'study': return 'study';
      default: return 'free';
    }
  };

  // Home 카드 전용 상태
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<{ time: string; subject: string }[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);

  // 캘린더 이벤트를 홈화면용 EventItem 형식으로 변환
  const convertCalendarEventsToEventItems = useCallback((calendarEvents: Record<string, any>) => {
    const events: EventItem[] = [];
    
    Object.entries(calendarEvents).forEach(([dateISO, dayEvents]) => {
      if (Array.isArray(dayEvents)) {
        dayEvents.forEach((event: any) => {
          // 미래 일정만 포함
          const eventDate = new Date(dateISO);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (eventDate >= today) {
            events.push({
              id: event.id?.toString() || `${dateISO}-${event.text}`,
              title: event.text,
              dateISO: dateISO
            });
          }
        });
      }
    });
    
    // 날짜순 정렬
    return events.sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));
  }, []);

  // 캘린더 이벤트 변경 시 홈화면 이벤트 업데이트
  useEffect(() => {
    if (Object.keys(calendarEvents).length > 0) {
      const convertedEvents = convertCalendarEventsToEventItems(calendarEvents);
      setEvents(convertedEvents);
    }
  }, [calendarEvents, convertCalendarEventsToEventItems]);
  // "예정된 일정 >" 클릭 시 서버에서 로드 + 스토어 동기화
  const handleOpenUpcoming = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    try {
      // 1. 캘린더 이벤트 로드 (이미 캘린더에서 생성된 일정들)
      await loadEventsFromServer();
      
      // 2. 과제 데이터 가져오기 (Assignment API)
      const assignments = await apiService.getUpcomingAssignments();
      
      // 과제를 ServerEvent 형식으로 변환해서 캘린더 스토어에 추가
      const serverEvents = assignments
        .filter(assignment => {
          const dueDate = new Date(assignment.due_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return dueDate >= today;
        })
        .map(assignment => ({
          id: assignment.id,
          title: `${assignment.subject} - ${assignment.title}`,
          due_date: assignment.due_date,
          description: assignment.description
        }));

      // 과제 데이터를 캘린더 스토어에 병합
      if (serverEvents.length > 0) {
        bulkImportFromServer(serverEvents);
      }

      setExpandedMonth(null); // 기본은 3개 모드
    } catch (error) {
      console.error('Failed to load upcoming events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [bulkImportFromServer, setSelectedDate, isLoggedIn, loadEventsFromServer]);

  // 오늘의 시간표 로드
  const loadTodaySchedule = useCallback(async () => {
    if (!isLoggedIn) return;
    
    try {
      setTimetableLoading(true);
      const result = await apiService.getTimetable();
      
      // 오늘 요일 계산 (0=월요일, 6=일요일)
      const today = new Date();
      const dayOfWeek = (today.getDay() + 6) % 7; // JS는 0=일요일이므로 월요일=0으로 변환
      
      const days = ['월', '화', '수', '목', '금', '토', '일'];
      const todayName = days[dayOfWeek];
      
      const todayTimetable = result.timetable[todayName] || {};
      
      // 시간표를 배열로 변환
      const schedule = [];
      for (let period = 1; period <= 7; period++) {
        const classInfo = todayTimetable[period];
        if (classInfo) {
          schedule.push({
            time: periodTimes[period - 1] || `${period}교시`,
            subject: classInfo.subject_name
          });
        }
      }
      
      setTodaySchedule(schedule);
    } catch (error) {
      console.error('Failed to load timetable:', error);
      // 에러 시 빈 배열 설정
      setTodaySchedule([]);
    } finally {
      setTimetableLoading(false);
    }
  }, [isLoggedIn]);

  // 인기 게시물 로드
  const loadPopularPosts = useCallback(async () => {
    try {
      setPopularLoading(true);
      // 인기 정렬로 게시글 가져오기 (상위 3개만)
      const result = await apiService.getPosts(1, '', 'popular');
      
      // PopularPost 형식으로 변환
      const formatted: PopularPost[] = result.posts.slice(0, 3).map(post => {
        // 게시 시간으로부터 몇 분 전인지 계산
        const now = new Date();
        const postTime = new Date(post.created_at);
        const diffMs = now.getTime() - postTime.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        return {
          id: post.id,
          title: post.title,
          excerpt: post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content,
          minutesAgo: diffMinutes,
          comments: post.comment_count ?? 0,
          likes: post.upvotes ?? 0,
          thumbnail: null, // 추후 이미지 지원 시 추가
          category: post.category
        };
      });
      
      setPopularPosts(formatted);
    } catch (error) {
      console.error('Failed to load popular posts:', error);
      setPopularPosts([]);
    } finally {
      setPopularLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 인기 게시물 로드
  useEffect(() => {
    loadPopularPosts();
  }, [loadPopularPosts]);

  // 로그인 상태 변경 시 시간표 로드
  useEffect(() => {
    if (isLoggedIn) {
      loadTodaySchedule();
    } else {
      setTodaySchedule([]);
    }
  }, [isLoggedIn, loadTodaySchedule]);

  // 로그인 상태 변경 시 예정된 일정 로드
  useEffect(() => {
    if (isLoggedIn) {
      handleOpenUpcoming();
    } else {
      setEvents(null);
    }
  }, [isLoggedIn, handleOpenUpcoming]);

  // 컴포넌트 마운트 시 캘린더 이벤트 로드
  useEffect(() => {
    if (isLoggedIn) {
      loadEventsFromServer();
    }
  }, [isLoggedIn, loadEventsFromServer]);

  // 화면에 포커스될 때마다 캘린더 이벤트 새로고침
  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        loadEventsFromServer();
      }
    }, [isLoggedIn, loadEventsFromServer])
  );

  // 파생 리스트
  const top3 = useMemo(() => (events ? events.slice(0, 3) : []), [events]);
  const monthAll = useMemo(() => {
    if (!events?.length) return [] as EventItem[];
    const key = expandedMonth ?? monthKey(events[0].dateISO);
    return events.filter((e) => monthKey(e.dateISO) === key);
  }, [events, expandedMonth]);
  const eventList = expandedMonth === null ? top3 : monthAll;

  return (
    <SafeAreaView style={styles.rootContainer}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 환영 메시지 & 로그인 버튼 */}
        <View style={styles.welcomeSection}>
          {isLoggedIn ? (
            <Text style={styles.welcomeText}>환영합니다 {user?.name || '사용자'}님</Text>
          ) : (
            <View style={styles.loginPrompt}>
              <Text style={styles.welcomeText}>환영합니다</Text>
              <Pressable 
                style={styles.loginButton}
                onPress={() => router.push('/login')}
              >
                <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.loginButtonText}>로그인</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* 오늘의 시간표 카드 */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.classInfoText}>
              {user?.grade && user?.class_num 
                ? `${user.grade}학년 ${user.class_num}반` 
                : '학급 정보 없음'}
            </Text>
            <Pressable 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => router.push('/timetable')}
            >
              <Ionicons name="book" size={20} color="#3B82F6" style={{ marginRight: 4 }} />
              <Text style={styles.scheduleTitle}>오늘 시간표 &gt;</Text>
            </Pressable>
          </View>
          {timetableLoading ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" />
            </View>
          ) : todaySchedule.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodsRow}>
              {todaySchedule.map((row, i) => (
                <View key={i} style={styles.periodItem}>
                  <Text style={styles.periodTime}>{row.time}</Text>
                  <Text style={styles.periodSubject}>{row.subject}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: '#666', fontSize: 14 }}>
                {isLoggedIn ? '오늘 시간표가 없습니다' : '로그인 후 시간표를 확인하세요'}
              </Text>
            </View>
          )}
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

          {/* 이벤트가 없을 때 표시 */}
          {!loading && (!events || events.length === 0) && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: '#666', fontSize: 14 }}>
                {isLoggedIn ? '예정된 일정이 없습니다' : '로그인 후 일정을 확인하세요'}
              </Text>
            </View>
          )}

          {/* 서버 데이터 렌더 */}
          {!loading && events && events.length > 0 && (
            <>
              {eventList.map((e, i) => {
                const isFirst = i === 0 && expandedMonth === null; // 접힘 모드: 첫 줄 강조
                return (
                  <Pressable 
                    key={e.id} 
                    style={[styles.eventItem, i !== 0 && styles.eventItemDivider, isFirst && styles.eventHighlight]}
                    onPress={() => {
                      // 캘린더 탭으로 이동하고 해당 날짜 선택
                      setSelectedDate(e.dateISO);
                      router.push('/(tabs)/calendar');
                    }}
                  >
                    <View style={styles.eventItemHeader}>
                      <Text style={styles.eventDateText}>{toDisplayMD(e.dateISO)}</Text>
                      <Text style={styles.eventDdayText}>{ddayLabel(e.dateISO)}</Text>
                    </View>
                    <Text style={[styles.eventNameText, isFirst && styles.eventNameHighlight]} numberOfLines={1} ellipsizeMode="tail">
                      {e.title}
                    </Text>
                  </Pressable>
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
            <Pressable onPress={() => router.push('/boards/hot')}>
              <Text style={styles.popularHeaderText}>인기 게시물 &gt;</Text>
            </Pressable>
          </View>

          {popularPosts.map((post, i) => (
            <Pressable
              key={post.id}
              onPress={() => {
                const boardId = getCategoryBoardId(post.category);
                router.push({ 
                  pathname: '/boards/[boardId]/[PostId]', 
                  params: { 
                    boardId: boardId, 
                    PostId: post.id.toString() 
                  } 
                });
              }}
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
                    <Ionicons name="thumbs-up-outline" size={14} color="#22c55e" style={{ marginLeft: 10 }} />
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
  rootContainer: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  welcomeSection: { 
    marginTop: 32, 
    marginBottom: 20, 
    paddingHorizontal: 24 
  },
  welcomeText: { 
    fontSize: 28, 
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5
  },
  loginPrompt: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  loginButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

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

  scheduleHeader: { 
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  classInfoText: { 
    fontSize: 14, 
    color: '#64748b',
    fontWeight: '500'
  },
  scheduleTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#3B82F6'
  },

  periodsRow: { 
    paddingTop: 12, 
    paddingBottom: 8,
    gap: 16
  },
  periodItem: { 
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6'
  },
  periodTime: { 
    fontWeight: '600', 
    color: '#1e293b',
    fontSize: 12,
    marginBottom: 4
  },
  periodSubject: { 
    fontSize: 14, 
    color: '#475569',
    fontWeight: '500',
    textAlign: 'center'
  },

  eventTitleRow: { 
    fontSize: 18, 
    fontWeight: '600',
    color: '#1e293b'
  },
  eventItem: { 
    paddingVertical: 16, 
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 8
  },
  eventItemDivider: { 
    borderTopWidth: 0
  },
  eventHighlight: { 
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b'
  },
  eventItemHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 8
  },
  eventDateText: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#374151'
  },
  eventDdayText: { 
    color: '#dc2626', 
    fontWeight: '700',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12
  },
  eventNameText: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#374151'
  },
  eventNameHighlight: { 
    color: '#1f2937'
  },
  eventMoreDots: { 
    textAlign: 'center', 
    color: '#6b7280', 
    marginTop: 12, 
    fontSize: 16, 
    fontWeight: '500',
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    borderRadius: 8
  },

  popularHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb'
  },
  popularHeaderText: { 
    fontSize: 18, 
    fontWeight: '600',
    color: '#1e293b'
  },
  popularItemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  popularItemDivider: { 
    borderTopWidth: 0
  },
  popularTitleText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1f2937',
    marginBottom: 4
  },
  popularExcerptText: { 
    fontSize: 14, 
    lineHeight: 20, 
    color: '#6b7280',
    marginBottom: 8
  },
  popularMetaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between'
  },
  popularTimeText: { 
    fontSize: 12, 
    color: '#9ca3af',
    fontWeight: '500'
  },
  popularMetaIcons: { 
    flexDirection: 'row', 
    alignItems: 'center'
  },
  popularMetaNum: { 
    fontSize: 12, 
    color: '#6b7280', 
    marginLeft: 6,
    fontWeight: '500'
  },
  popularThumbImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 12,
    marginLeft: 12
  },
  popularThumbPlaceholder: { 
    width: 60, 
    height: 60, 
    borderRadius: 12, 
    backgroundColor: '#f3f4f6',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
