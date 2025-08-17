import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Write() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const submit = () => {
    // TODO: 서버/스토리지에 저장 로직
    Alert.alert('등록 완료', `boardId=${boardId}\n제목=${title}`);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="제목"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="내용"
        style={[styles.input, { height: 160 }]}
        multiline
        value={body}
        onChangeText={setBody}
      />
      <TouchableOpacity style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>등록</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    padding: 12, marginBottom: 14, fontSize: 16,
  },
  btn: {
    backgroundColor: '#007bff', padding: 14, borderRadius: 10, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
