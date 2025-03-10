import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

export const speakText = (text: string) => {
    if (Platform.OS === 'web') {
      // Web: Use Web Speech API for text-to-speech
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      // Mobile: Use Expo Speech API for text-to-speech
      Speech.speak(text, {
        language: 'en',
      });
    }
  };
