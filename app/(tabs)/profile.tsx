// Profile.tsx / Profile.jsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const SECTION_1 = [
  { label: '차단 목록',            icon: 'ban', action: 'blocked' },
  { label: '작성한 글',            icon: 'create-outline', action: 'my-posts' },
  { label: '추천 / 비추천 한 글',   icon: 'thumbs-up-outline', action: 'voted-posts' },
];

const SECTION_2 = [
  { label: '학급 설정', icon: 'school-outline', action: 'class-settings' },
  { label: '시간표 설정', icon: 'time-outline', action: 'timetable-settings' },
  { label: '알림 설정', icon: 'notifications-outline', action: 'notifications' },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSettingsPress = () => {
    router.push('/setup');
  };

  const handleItemPress = (action: string) => {
    switch (action) {
      case 'my-posts':
        router.push('/my-posts');
        break;
      case 'voted-posts':
        router.push('/voted-posts');
        break;
      case 'class-settings':
        router.push('/setup');
        break;
      case 'timetable-settings':
        // Navigate to timetable settings (could be the calendar screen)
        router.push('/(tabs)/calendar');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  const userName = user?.name || '게스트';

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 상단 환영 카드 */}
        <View style={s.welcomeCard}>
          <View style={s.userInfo}>
            <Text style={s.welcomeText}>{`환영합니다 ${userName}님`}</Text>
            {user?.grade && user?.class_num && (
              <Text style={s.userDetail}>{`${user.grade}학년 ${user.class_num}반`}</Text>
            )}
          </View>
          <Pressable onPress={handleSettingsPress} style={s.gearBtn}>
            <Ionicons name="settings-sharp" size={20} color="#111" />
          </Pressable>
        </View>

        {/* 섹션 1 */}
        <Text style={s.sectionTitle}>내 활동</Text>
        <View style={s.listBox}>
          {SECTION_1.map((item, i) => (
            <Pressable
              key={i}
              onPress={() => handleItemPress(item.action)}
              style={[s.itemRow, i !== 0 && s.itemDivider]}
            >
              <View style={s.itemIconWrap}>
                <Ionicons name={item.icon as any} size={18} color="#111" />
              </View>
              <Text style={s.itemLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" style={{ marginLeft: 'auto' }} />
            </Pressable>
          ))}
        </View>

        {/* 섹션 2 */}
        <Text style={[s.sectionTitle, { marginTop: 22 }]}>설정</Text>
        <View style={s.listBox}>
          {SECTION_2.map((item, i) => (
            <Pressable
              key={i}
              onPress={() => handleItemPress(item.action)}
              style={[s.itemRow, i !== 0 && s.itemDivider]}
            >
              <View style={s.itemIconWrap}>
                <Ionicons name={item.icon as any} size={18} color="#111" />
              </View>
              <Text style={s.itemLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" style={{ marginLeft: 'auto' }} />
            </Pressable>
          ))}
        </View>

        {/* 로그아웃 버튼 */}
        {user && (
          <View style={[s.listBox, { marginTop: 22 }]}>
            <Pressable
              onPress={handleLogout}
              style={s.itemRow}
              disabled={isLoggingOut}
            >
              <View style={[s.itemIconWrap, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="log-out-outline" size={18} color="#dc2626" />
              </View>
              <Text style={[s.itemLabel, { color: '#dc2626' }]}>
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#dc2626" style={{ marginLeft: 'auto' }} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    paddingTop: 20, 
    paddingBottom: 20,
    paddingLeft: 16, 
    paddingRight: 16 
  },

  // 상단 환영 카드 (홈 카드 스타일과 톤 맞춤)
  welcomeCard: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  userInfo: { 
    flex: 1 
  },
  welcomeText: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#1e293b',
    marginBottom: 4
  },
  userDetail: { 
    fontSize: 15, 
    color: '#64748b', 
    fontWeight: '500'
  },
  gearBtn: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // 섹션 제목
  sectionTitle: {
    marginHorizontal: 4,
    marginBottom: 12,
    marginTop: 16,
    fontSize: 18,
    color: '#374151',
    fontWeight: '700',
  },

  // 리스트 박스 (배경은 투명, 항목만 구분선)
  listBox: {
    marginHorizontal: 0,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // 항목
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  itemIconWrap: {
    width: 40, 
    height: 40, 
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemLabel: { 
    fontSize: 16, 
    color: '#374151',
    fontWeight: '500'
  },
});
