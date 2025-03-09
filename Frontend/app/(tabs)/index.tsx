import { Redirect } from 'expo-router';
import { FontSizeProvider } from '@/contexts/FontSizeContext'

export default function Index() {
  return (
  <FontSizeProvider>
    <Redirect href="/home" />
  </FontSizeProvider>
  );
}