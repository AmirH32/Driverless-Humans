import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import api from "@/services/api";
import { useFontSize } from '@/contexts/FontSizeContext';
import { speakText } from '@/services/ttsUtils';

export default function SettingsScreen() {
  const router = useRouter();

  // Font scaling
  const {fontScale, setFontScale} = useFontSize();
  const styles = createStyles(fontScale);

  const handleLogout = async () => {
    try {
      // Send the POST request to logout
      const response = await api.post('/logout');
      if (response.status === 200 && response.data.success) {
        // Show an alert on successful logout
        alert('Success, You have been logged out successfully.');
        delete api.defaults.headers.common['Authorization'];
        // Navigate to the home screen after logout
        router.push('/home');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Error, There was an issue logging out. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Settings</ThemedText>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.button, styles.profileButton]}
        onPress={() => {router.push('/profile'); speakText('Profile button clicked')}}
      >
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.disabilityButton]}
        onPress={() => {router.push('/disability'); speakText('Disability Information button clicked')}}
      >
        <Text style={styles.buttonText}>Disability Info</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.accessibilityButton]}
        onPress={() => {router.push('/accessibility'); speakText('Accessibility settings button clicked')}}
      >
        <Text style={styles.buttonText}>Accessibility</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.helpButton]}
        onPress={() => {router.push('/help'); speakText('Help and support button clicked')}}
      >
        <Text style={styles.buttonText}>Help & Support</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}

      >
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const createStyles = (fontScale: number) => {
  return (
    StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: -40,
      },
      title: {
        fontSize: 40 * fontScale,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 40 * fontScale,
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
        fontSize: 25 * fontScale,
        lineHeight: 25 * fontScale * 1.2,
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
    })
  )
};
