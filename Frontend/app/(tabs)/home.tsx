import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const handlePress = (buttonType: string) => {
    console.log(`${buttonType} Pressed!`);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Plan and Track your journey!</ThemedText>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, styles.loginButton]} // Apply styles for login button
        onPress={() => handlePress('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign up Button */}
      <TouchableOpacity
        style={[styles.button, styles.signupButton]} // Apply styles for signup button
        onPress={() => handlePress('Sign up')}
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
  },
  title: {
    fontSize: 32, // Title size
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 2,
    marginBottom: 60, // Adds space below the title
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