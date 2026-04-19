import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function HabitLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
