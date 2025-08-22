import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function SetupScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    student_id: user?.student_id || '',
    grade: user?.grade || 1,
    class_num: user?.class_num || 1,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.student_id.trim()) {
      Alert.alert('입력 확인', '학번을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await updateUser(formData);
      Alert.alert('설정 완료', '프로필 설정이 완료되었습니다.', [
        { text: '확인', onPress: () => router.replace('/(tabs)/home') }
      ]);
    } catch (error) {
      Alert.alert('오류', '프로필 설정 중 오류가 발생했습니다.');
      console.error('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      '설정 건너뛰기',
      '나중에 프로필에서 설정할 수 있습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '건너뛰기', onPress: () => router.replace('/(tabs)/home') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>프로필 설정</Text>
          <Text style={styles.subtitle}>
            학급 정보를 설정하면 더 정확한{'\n'}
            시간표와 정보를 받아볼 수 있습니다.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>학번</Text>
            <TextInput
              style={styles.input}
              value={formData.student_id}
              onChangeText={(text) => setFormData(prev => ({ ...prev, student_id: text }))}
              placeholder="예: 2401"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>학년</Text>
            <View style={styles.pickerContainer}>
              {[1, 2, 3].map((grade) => (
                <Pressable
                  key={grade}
                  style={[
                    styles.pickerOption,
                    formData.grade === grade && styles.pickerOptionSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, grade }))}
                >
                  <Text style={[
                    styles.pickerText,
                    formData.grade === grade && styles.pickerTextSelected
                  ]}>
                    {grade}학년
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>반</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.pickerRow}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((classNum) => (
                    <Pressable
                      key={classNum}
                      style={[
                        styles.pickerOption,
                        styles.classOption,
                        formData.class_num === classNum && styles.pickerOptionSelected
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, class_num: classNum }))}
                    >
                      <Text style={[
                        styles.pickerText,
                        formData.class_num === classNum && styles.pickerTextSelected
                      ]}>
                        {classNum}반
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? '저장 중...' : '설정 완료'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSkip}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>나중에 설정</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 1,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    gap: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  classOption: {
    minWidth: 60,
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pickerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  pickerTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
    paddingTop: 24,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#666',
  },
});