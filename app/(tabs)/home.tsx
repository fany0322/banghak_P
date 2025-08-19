import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

// 오늘의 시간표 데이터
const todaySchedule = [
  { time: '08:40', subject: '수학' },
  { time: '09:40', subject: '문학' },
  { time: '10:40', subject: '영어' },
  { time: '11:40', subject: '통사' },
  { time: '13:30', subject: '시디' },
  { time: '14:30', subject: '시디' },
  { time: '15:30', subject: '국사' }
];

// 예정된 일정 데이터
const upcomingEvents = [
  { date: '7월 24일', dday: 'D-day', title: '영어 수행평가 (말하기)' },
  { date: '7월 25일', dday: 'D-1', title: '영어 수행평가 (쓰기)' },
  { date: '8월 1일',  dday: 'D-8',  title: '엄청나게 긴 이름의 수행평가를 적으면 말을 줄이기 (말을 줄이기)' }
];

// 인기 게시물 데이터
const popularPosts = [
  { title: '글제목제목', excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed ㅁㅇㄹdo eiu..ㅁㄴㅇㄻㄴㄹㄴㅁㄻㄴ.', minutesAgo: 1, comments: 0, likes: 9, thumbnail: null },
  { title: '글제목제목', excerpt: '짧은 요약문이 들어갑니다...', minutesAgo: 5, comments: 3, likes: 12, thumbnail: null },
  { title: '글제목제목', excerpt: '다른 게시물 요약...', minutesAgo: 22, comments: 1, likes: 4, thumbnail: null },
];

export default function Home() {
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
            <Text style={styles.eventTitleRow}>예정된 일정 &gt;</Text>
          </View>
          {upcomingEvents.map((event, i) => {
            const isFirst = i === 0;
            return (
              <View key={i} style={[
                styles.eventItem,
                !isFirst && styles.eventItemDivider,
                isFirst && styles.eventHighlight
              ]}>
                <View style={styles.eventItemHeader}>
                  <Text style={styles.eventDateText}>{event.date}</Text>
                  <Text style={styles.eventDdayText}>{event.dday}</Text>
                </View>
                <Text style={[
                  styles.eventNameText,
                  isFirst && styles.eventNameHighlight
                ]} numberOfLines={1} ellipsizeMode='tail'>{event.title}</Text>
              </View>
            );
          })}
          <Text style={styles.eventMoreDots}>···</Text>
        </View>

        {/* 인기 게시물 카드 */}
        <View style={styles.popularCard}>
          <View style={styles.popularHeaderRow}>
            <Ionicons name="flame-outline" size={18} color="#111" style={{ marginRight: 6 }} />
            <Text style={styles.popularHeaderText}>인기 게시물 &gt;</Text>
            <Text style={styles.popularHeaderArrow}>›</Text>
          </View>

          {popularPosts.map((post, i) => (
            <View key={i} style={[
              styles.popularItemRow,
              i !== 0 && styles.popularItemDivider
            ]}>
              {/* 게시물 왼쪽 텍스트 영역 */}
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.popularTitleText} numberOfLines={1}>{post.title}</Text>
                <Text style={styles.popularExcerptText} numberOfLines={2}>{post.excerpt}</Text>

                <View style={styles.popularMetaRow}>
                  <Text style={styles.popularTimeText}>{post.minutesAgo}분 전</Text>
                  <View style={styles.popularMetaIcons}>
                    {/* 댓글 아이콘 - 파란색 */}
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color="#3B82F6" />
                    <Text style={styles.popularMetaNum}>{post.comments}</Text>
                    {/* 좋아요(엄지) 아이콘 - 주황색 */}
                    <Ionicons name="thumbs-up-outline" size={14} color="#FF4830" style={{ marginLeft: 10 }} />
                    <Text style={styles.popularMetaNum}>{post.likes}</Text>
                  </View>
                </View>
              </View>
              {/* 게시물 썸네일 */}
              {post.thumbnail ? (
                <Image source={{ uri: post.thumbnail }} style={styles.popularThumbImage} />
              ) : (
                <View style={styles.popularThumbPlaceholder} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 스타일 정의 
const styles = StyleSheet.create({ 
  rootContainer: { flex: 1, backgroundColor: '#f8f9fa' }, // 전체 배경
  welcomeText: { fontSize: 24, fontWeight: 'bold', marginTop: 24, marginBottom: 16, paddingHorizontal: 20 }, // 환영 메시지

  // 카드 공통 스타일
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

  // 시간표 카드 헤더
  scheduleHeader: {
    marginBottom: 8,
  },
  classInfoText: {
    fontSize: 13,
    color: '#000',
    opacity: 0.7
  },
  scheduleTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },

  // 시간표 행
  periodsRow: {
    paddingTop: 6,
    paddingBottom: 2,
  },
  periodItem: {
    alignItems: 'center',
    marginRight: 12, // 열 간격
  },
  periodTime: { fontWeight: '500', color: '#000000CC' },
  periodSubject: { fontSize: 14, color: '#101010' },

  // 일정 카드
  eventTitleRow: {
    fontSize: 18,
    fontWeight: '500',
  },
  eventItem: { paddingVertical: 14, borderRadius: 12, paddingHorizontal: 12 },
  eventItemDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  eventHighlight: {
    backgroundColor: '#FFEDEA', // 연한 살구/레드 톤
  },
  eventItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventDateText: { fontSize: 18, fontWeight: '500' },
  eventDdayText: { color: '#FF4830', fontWeight: '600' },
  eventNameText: { fontSize: 18, fontWeight: '500' },
  eventNameHighlight: { color: '#333' },
  eventMoreDots: { textAlign: 'center', color: '#101010', marginTop: 6, fontSize: 18, fontWeight: '500' },

  // 인기 게시물 카드
  popularHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  popularHeaderText: { fontSize: 18, fontWeight: '500' },
  popularHeaderArrow: { marginLeft: 'auto', fontSize: 20, lineHeight: 20, opacity: 0.8 },

  popularItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  popularItemDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  popularTitleText: { fontSize: 18, fontWeight: '600', color: '#111' },
  popularExcerptText: { marginTop: 6, fontSize: 15, lineHeight: 20, color: '#555' },

  popularMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  popularTimeText: { fontSize: 13, color: '#666', marginRight: 8 },
  popularMetaIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  popularMetaNum: { fontSize: 13, color: '#444', marginLeft: 4 },

  popularThumbImage: {
    width: 64, height: 88, borderRadius: 14,
  },
  popularThumbPlaceholder: {
    width: 64, height: 88, borderRadius: 14,
    backgroundColor: '#D9B15E',
  },
});
