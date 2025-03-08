import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Settings</ThemedText>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.button, styles.profileButton]}
        onPress={() => router.push('/profile')}
      >
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.disabilityButton]}
        onPress={() => router.push('/disability')}
      >
        <Text style={styles.buttonText}>Disability Info</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.accessibilityButton]}
        onPress={() => router.push('/accessibility')}
      >
        <Text style={styles.buttonText}>Accessibility</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.helpButton]}
        onPress={() => router.push('/help')}
      >
        <Text style={styles.buttonText}>Help & Support</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={() => router.push('/home')}  // TODO: Implement Logout logic
      >
        <Text style={styles.buttonText}>Log out</Text>
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
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 2,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 25,
    borderRadius: 15,
    marginTop: 20,
    width: 300,
  },
  buttonText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  profileButton: {
  },
  disabilityButton: {
  },
  accessibilityButton: {
  },
  helpButton: {
  },
  logoutButton: {
    backgroundColor: '#E30000',
  },
});