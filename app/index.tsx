import { Redirect } from 'expo-router';

export default function Index() {
  // 앱 실행 시 자동으로 /home 탭으로 이동
  return <Redirect href="/(tabs)/home" />;
}
