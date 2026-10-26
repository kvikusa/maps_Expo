import { Stack } from 'expo-router';
import { MarkerProvider } from '../context/MarkerContext';

export default function RootLayout() {
  return (
    <MarkerProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Карта', headerShown: false }} />
        <Stack.Screen name="marker/[id]" options={{ title: 'Детали маркера' }} />
      </Stack>
    </MarkerProvider>
  );
}