import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService, TimetableData, TimetableItem } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const PERIOD_TIMES = ['08:40', '09:40', '10:40', '11:40', '13:30', '14:30', '15:30'];

export default function TimetableScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [timetable, setTimetable] = useState<TimetableData>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: string; period: number } | null>(null);
  const [editForm, setEditForm] = useState({
    subject_name: '',
    teacher_name: '',
    classroom: ''
  });

  const loadTimetable = async () => {
    if (!isLoggedIn) return;
    
    try {
      setLoading(true);
      const result = await apiService.getTimetable();
      setTimetable(result.timetable);
    } catch (error) {
      console.error('Failed to load timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadTimetable();
    }
  }, [isLoggedIn]);

  const handleCellPress = (day: string, period: number) => {
    if (!editMode) return;
    
    const currentItem = timetable[day]?.[period];
    setSelectedCell({ day, period });
    setEditForm({
      subject_name: currentItem?.subject_name || '',
      teacher_name: currentItem?.teacher_name || '',
      classroom: currentItem?.classroom || ''
    });
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedCell || !editForm.subject_name.trim()) {
      Alert.alert('알림', '과목명을 입력해주세요.');
      return;
    }

    try {
      const dayIndex = DAYS.indexOf(selectedCell.day);
      const currentItem = timetable[selectedCell.day]?.[selectedCell.period];
      
      if (currentItem) {
        // 업데이트
        await apiService.updateTimetableItem(currentItem.id, {
          ...editForm,
          subject_name: editForm.subject_name.trim(),
          teacher_name: editForm.teacher_name.trim() || undefined,
          classroom: editForm.classroom.trim() || undefined
        });
      } else {
        // 새로 추가
        await apiService.addTimetableItem({
          ...editForm,
          subject_name: editForm.subject_name.trim(),
          teacher_name: editForm.teacher_name.trim() || undefined,
          classroom: editForm.classroom.trim() || undefined,
          day_of_week: dayIndex,
          period: selectedCell.period
        });
      }
      
      await loadTimetable();
      setEditModal(false);
      setSelectedCell(null);
    } catch (error: any) {
      Alert.alert('오류', error.message || '저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedCell) return;
    
    const currentItem = timetable[selectedCell.day]?.[selectedCell.period];
    if (!currentItem) return;

    Alert.alert(
      '삭제 확인',
      '이 시간표 항목을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteTimetableItem(currentItem.id);
              await loadTimetable();
              setEditModal(false);
              setSelectedCell(null);
            } catch (error: any) {
              Alert.alert('오류', error.message || '삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const renderCell = (day: string, period: number) => {
    const item = timetable[day]?.[period];
    const isEditable = editMode;
    
    return (
      <Pressable
        key={`${day}-${period}`}
        style={[
          styles.cell,
          item && styles.cellFilled,
          isEditable && styles.cellEditable
        ]}
        onPress={() => handleCellPress(day, period)}
        disabled={!isEditable}
      >
        {item ? (
          <View style={styles.cellContent}>
            <Text style={styles.subjectText} numberOfLines={1}>
              {item.subject_name}
            </Text>
            {item.teacher_name && (
              <Text style={styles.teacherText} numberOfLines={1}>
                {item.teacher_name}
              </Text>
            )}
            {item.classroom && (
              <Text style={styles.classroomText} numberOfLines={1}>
                {item.classroom}
              </Text>
            )}
          </View>
        ) : isEditable ? (
          <Ionicons name="add" size={20} color="#ccc" />
        ) : null}
      </Pressable>
    );
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>시간표</Text>
        </View>
        
        <View style={styles.centerContent}>
          <Ionicons name="person-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>로그인이 필요합니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>시간표</Text>
        <Pressable 
          onPress={() => setEditMode(!editMode)}
          style={styles.editButton}
        >
          <Ionicons 
            name={editMode ? "checkmark" : "create-outline"} 
            size={20} 
            color={editMode ? "#4CAF50" : "#666"} 
          />
          <Text style={[styles.editButtonText, editMode && { color: "#4CAF50" }]}>
            {editMode ? "완료" : "편집"}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>시간표를 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.timetableContainer}>
            {/* 헤더 */}
            <View style={styles.row}>
              <View style={styles.timeHeader} />
              {DAYS.map(day => (
                <View key={day} style={styles.dayHeader}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              ))}
            </View>
            
            {/* 시간표 */}
            {PERIODS.map(period => (
              <View key={period} style={styles.row}>
                <View style={styles.timeCell}>
                  <Text style={styles.periodText}>{period}</Text>
                  <Text style={styles.timeText}>{PERIOD_TIMES[period - 1]}</Text>
                </View>
                {DAYS.map(day => renderCell(day, period))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* 편집 모달 */}
      <Modal
        visible={editModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>시간표 편집</Text>
              <Pressable onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </Pressable>
            </View>
            
            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>과목명 *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.subject_name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, subject_name: text }))}
                  placeholder="수학, 영어 등"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>선생님</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.teacher_name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, teacher_name: text }))}
                  placeholder="담당 선생님 이름"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>교실</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.classroom}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, classroom: text }))}
                  placeholder="3-5, 과학실 등"
                />
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              {timetable[selectedCell?.day || '']?.[selectedCell?.period || 0] && (
                <Pressable style={styles.deleteButton} onPress={handleDeleteItem}>
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </Pressable>
              )}
              <Pressable style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>저장</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 16,
    color: '#666',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  timetableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
  timeHeader: {
    width: 60,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  dayHeader: {
    flex: 1,
    height: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timeCell: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  cell: {
    flex: 1,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  cellFilled: {
    backgroundColor: '#f0f8ff',
  },
  cellEditable: {
    backgroundColor: '#f8f9fa',
  },
  cellContent: {
    padding: 4,
    alignItems: 'center',
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  teacherText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  classroomText: {
    fontSize: 10,
    color: '#888',
    marginTop: 1,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalForm: {
    padding: 20,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ff4444',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});