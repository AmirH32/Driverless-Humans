import React from 'react';
import { TouchableOpacity, StyleSheet, Text, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Speech from 'expo-speech'; // Import the Speech module

export default function HomeScreen() {
  const router = useRouter();

  const speakText = (text: string) => {
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

  return (
    <ThemedView style={styles.container}>
      <Image source={require('../../assets/images/council_logo.png')} style={styles.topLeftImage} />
      <Image source={require('../../assets/images/buses.png')} style={styles.mainImage} /> 
      
      <ThemedText style={styles.title}>Plan and Track your journey!</ThemedText>

         {/* Login Button */}
         <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={() => {
          router.push('/login');
          speakText('Login button clicked');
        }}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign up Button */}
      <TouchableOpacity
        style={[styles.button, styles.signupButton]}
        onPress={() => {
          router.push('/signup');
          speakText('Sign up button clicked');
        }}
      >
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>

      {/* Volunteer Sign up Button */}
      <TouchableOpacity
        style={[styles.button, styles.volunteerButton]}
        onPress={() => {
          router.push('/volunteerSignup');
          speakText('Sign up as volunteer button clicked');
        }}
      >
        <Text style={styles.buttonText}>Sign up as a volunteer</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  topLeftImage: {
    position: 'absolute',
    top: 65,
    left: 0,
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
  mainImage: {
    width: 390,
    height: 280,
    marginBottom: 0,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 2,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginButton: {
    paddingHorizontal: 100,
  },
  signupButton: {
    paddingHorizontal: 90,
  },
  volunteerButton: {
    backgroundColor: '#8400BD',
    paddingHorizontal: 23,
  },
});