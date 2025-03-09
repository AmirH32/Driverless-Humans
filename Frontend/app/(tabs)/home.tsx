import React from 'react';
import { TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <Image source={require('../../assets/images/council_logo.png')} style={styles.topLeftImage} />
      <Image source={require('../../assets/images/buses.png')} style={styles.mainImage} /> 
      
      <ThemedText style={styles.title}>Plan and Track your journey!</ThemedText>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign up Button */}
      <TouchableOpacity
        style={[styles.button, styles.signupButton]}
        onPress={() => router.push('/signup')}
      >
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>

      {/* Volunteer Sign up Button */}
      <TouchableOpacity
        style={[styles.button, styles.volunteerButton]}
        onPress={() => router.push('/volunteer_signup')}
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