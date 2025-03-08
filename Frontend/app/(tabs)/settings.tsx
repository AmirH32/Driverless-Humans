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
        onPress={() => router.push('/home')}
      >
        <Text style={styles.buttonText}>Disability Info</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.accessibilityButton]}
        onPress={() => router.push('/home')}
      >
        <Text style={styles.buttonText}>Accessibility</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.helpButton]}
        onPress={() => router.push('/home')}
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
    overflowY: 'scroll',
  },
  scrollableWindow: {
    borderRadius: 2,
    borderColor: 'grey',
    overflowY: 'scroll',// ! this one actually should be lol
    maxHeight: '80vh',
  },
  settingsEntry: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '##36b7ff',
    height: 100,

    
  },
  entryText: {
    color: '#FFFFFF',
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