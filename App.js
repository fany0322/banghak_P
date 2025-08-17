import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import {
    FlatList, Modal,
    SafeAreaView,
    StyleSheet, Text, TextInput,
    TouchableOpacity, View
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

const Tab = createBottomTabNavigator()

const schedule = [
  { time: '08:40', subject: '수학' },
  { time: '09:40', subject: '문학' },
  { time: '10:40', subject: '영어' },
  { time: '11:40', subject: '통사' },
  { time: '13:30', subject: '시디' },
  { time: '14:30', subject: '시디' },
  { time: '15:30', subject: '국사' }
]

const events = [
  { date: '7월 24일', dday: 'D-day', title: '영어 수행평가 (말하기)' },
  { date: '7월 25일', dday: 'D-1', title: '영어 수행평가 (쓰기)' },
  { date: '8월 1일', dday: 'D-8', title: '수행평가 말 줄이기 훈련' }
]

function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>환영합니다 000님</Text>

      <Text style={styles.sectionTitle}>📘 오늘 시간표</Text>
      {schedule.map((s, idx) => (
        <Text key={idx} style={styles.scheduleText}>
          {s.time} - {s.subject}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>📅 예정된 일정</Text>
      {events.map((e, idx) => (
        <Text key={idx} style={styles.eventText}>
          {e.date} {e.dday} - {e.title}
        </Text>
      ))}
    </SafeAreaView>
  )
}

function BoardScreen() {
  const [posts, setPosts] = useState([
    { id: '1', title: '첫 번째 글', content: '이건 첫 번째 게시글입니다.' },
    { id: '2', title: '두 번째 글', content: '두 번째 글의 내용이에요.' }
  ])
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const addPost = () => {
    if (!newTitle.trim()) return
    const newPost = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent
    }
    setPosts([newPost, ...posts])
    setNewTitle('')
    setNewContent('')
    setShowModal(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>게시판</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <Text style={styles.modalHeader}>게시글 작성</Text>
          <TextInput
            style={styles.input}
            placeholder="제목"
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="내용"
            value={newContent}
            onChangeText={setNewContent}
            multiline
          />
          <TouchableOpacity style={styles.submitButton} onPress={addPost}>
            <Text style={styles.submitButtonText}>등록</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowModal(false)}>
            <Text style={styles.cancelText}>닫기</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

function CalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>캘린더 (추후 추가)</Text>
    </SafeAreaView>
  )
}

function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>프로필 (추후 추가)</Text>
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName
            if (route.name === '홈') iconName = 'home'
            else if (route.name === '게시판') iconName = 'chatbox'
            else if (route.name === '캘린더') iconName = 'calendar'
            else if (route.name === '프로필') iconName = 'person'
            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: 'gray'
        })}
      >
        <Tab.Screen name="홈" component={HomeScreen} />
        <Tab.Screen name="게시판" component={BoardScreen} />
        <Tab.Screen name="캘린더" component={CalendarScreen} />
        <Tab.Screen name="프로필" component={ProfileScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 40
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5
  },
  scheduleText: {
    fontSize: 16,
    marginBottom: 3
  },
  eventText: {
    fontSize: 16,
    marginBottom: 3,
    color: '#d22'
  },
  post: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  title: {
    fontSize: 17,
    fontWeight: '600'
  },
  content: {
    marginTop: 8,
    fontSize: 15,
    color: '#555'
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#007bff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 30
  },
  modal: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  cancelText: {
    marginTop: 20,
    textAlign: 'center',
    color: 'gray',
    fontSize: 15
  }
})
