import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AccessibilityScreen() {
  const router = useRouter();

  // State for theme toggle
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={styles.crossButton}
        onPress={() => router.push('/settings')}
      >
        <Text style={styles.crossText}>✕</Text>
      </TouchableOpacity>

      <ThemedText style={styles.title}>Accessibility</ThemedText>

      {/* Font Size Box */}
      <View style={styles.box}>
        <Text style={styles.boxTitle}>Font Size</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.fontButton}>
            <Text style={styles.fontButtonText}>Small</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fontButton}>
            <Text style={styles.fontButtonText}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fontButton}>
            <Text style={styles.fontButtonText}>Big</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fontButton}>
            <Text style={styles.fontButtonText}>Large</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Theme Box */}
      <View style={styles.box}>
        <Text style={styles.boxTitle}>Theme</Text>
        <View style={styles.themeToggleContainer}>
          <Text style={styles.themeText}>Light</Text>
          <Switch
            value={isDarkTheme}
            onValueChange={toggleTheme}
            thumbColor={isDarkTheme ? '#f4f3f4' : '#f4f3f4'}
            trackColor={{ false: '#81b0ff', true: '#767577' }}
          />
          <Text style={styles.themeText}>Dark</Text>
        </View>
      </View>

      {/* Text to Speech Button */}
      <TouchableOpacity style={[styles.button, styles.textToSpeechButton]}>
        <Text style={styles.buttonText}>Enable Text to Speech</Text>
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
  crossButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 10,
    zIndex: 1,
    marginTop: 40,
  },
  crossText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 2,
    marginBottom: 30,
  },
  box: {
    backgroundColor: '#007BFF',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  boxTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    flexWrap: 'nowrap',
    marginTop: 10,
  },
  fontButton: {
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 15,
    marginBottom: 10,
    marginHorizontal: 5,
    width: 70,
  },
  fontButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  themeText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textToSpeechButton: {
    backgroundColor: '#007BFF',
    width: '100%',
    paddingVertical: 25,
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 15,
    marginTop: 20,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});