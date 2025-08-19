// Profile.tsx / Profile.jsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const SECTION_1 = [
  { label: '차단 목록',            icon: 'ban' },
  { label: '작성한 글',            icon: 'create-outline' },
  { label: '추천 / 비추천 한 글',   icon: 'thumbs-up-outline' },
  { label: '설정',                 icon: 'settings-outline' },
];

const SECTION_2 = [
  { label: '설정', icon: 'options-outline' },
  { label: '설정', icon: 'notifications-outline' },
  { label: '설정', icon: 'color-palette-outline' },
  { label: '설정', icon: 'shield-checkmark-outline' },
];

export default function Profile() {
  const userName = '000'; // 필요하면 실제 사용자명으로 바꿔줘

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 상단 환영 카드 */}
        <View style={s.welcomeCard}>
          <Text style={s.welcomeText}>{`환영합니다 ${userName}님`}</Text>
          <Pressable onPress={() => console.log('프로필 설정 눌림')} style={s.gearBtn}>
            <Ionicons name="settings-sharp" size={20} color="#111" />
          </Pressable>
        </View>

        {/* 섹션 1 */}
        <Text style={s.sectionTitle}>설정1</Text>
        <View style={s.listBox}>
          {SECTION_1.map((item, i) => (
            <Pressable
              key={i}
              onPress={() => console.log(item.label)}
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
        <Text style={[s.sectionTitle, { marginTop: 22 }]}>설정2</Text>
        <View style={s.listBox}>
          {SECTION_2.map((item, i) => (
            <Pressable
              key={i}
              onPress={() => console.log(item.label)}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 16, paddingBottom: 16,paddingLeft:14, paddingRight: 14 },

  // 상단 환영 카드 (홈 카드 스타일과 톤 맞춤)
  welcomeCard: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  welcomeText: { fontSize: 20, fontWeight: '700', color: '#111', flex: 1 },
  gearBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  // 섹션 제목
  sectionTitle: {
    marginHorizontal: 12,
    marginBottom: 10,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },

  // 리스트 박스 (배경은 투명, 항목만 구분선)
  listBox: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: 'transparent',
  },

  // 항목
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  itemDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  itemIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  itemLabel: { fontSize: 16, color: '#111' },
});
