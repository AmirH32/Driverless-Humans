import React from 'react';
import { TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const router = useRouter(); // Initialize router

  return (
    <ThemedView style={styles.container}>
      <Image source={require('../../assets/images/council_logo.png')} style={styles.topLeftImage} />
      <Image source={require('../../assets/images/buses.png')} style={styles.mainImage} /> 
      
      <ThemedText style={styles.title}>Plan and Track your journey!</ThemedText>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, styles.loginButton]} // Apply styles for login button
        onPress={() => router.push('/login')}  // Navigate to login page
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign up Button */}
      <TouchableOpacity
        style={[styles.button, styles.signupButton]} // Apply styles for signup button
        onPress={() => router.push('/signup')} // Navigate to signup page
      >
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    paddingHorizontal: 20, // Adds some space on the sides
    marginTop: -40, // Moves everything upwards
  },
  topLeftImage: {
    position: 'absolute', // Positions the image freely
    top: 65,
    left: 0,
    width: 200,
    height: 100,
    resizeMode: 'contain', // Ensures image scales properly
  },
  mainImage: {
    width: 390,
    height: 280,
    marginBottom: 0,
    resizeMode: 'contain', // Ensures image scales properly
  },
  title: {
    fontSize: 32, // Title size
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 2,
    marginBottom: 30, // Adds space below the title
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
});