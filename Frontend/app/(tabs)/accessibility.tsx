import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFontSize } from '@/contexts/FontSizeContext';
import { speakText } from '@/services/ttsUtils';

export default function AccessibilityScreen() {
  const router = useRouter();
  const {fontScale, setFontScale} = useFontSize();

  // State for theme toggle
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const styles = createStyles(fontScale, isDarkTheme);

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
          <TouchableOpacity style={styles.fontButton} onPress={() => setFontScale(0.85)}>
            <Text style={styles.fontButtonText}>Small</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fontButton} onPress={() => setFontScale(1)}>
            <Text style={styles.fontButtonText}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fontButton} onPress={() => setFontScale(1.15)}>
            <Text style={styles.fontButtonText}>Big</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fontButton} onPress={() => setFontScale(1.3)}>
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
            onValueChange={(value) => {
              toggleTheme(); // Correctly call the toggleTheme function
              speakText(value ? 'Dark theme enabled' : 'Light theme enabled'); // Speak based on the toggle
            }}
            thumbColor={isDarkTheme ? '#f4f3f4' : '#f4f3f4'}
            trackColor={{ false: '#81b0ff', true: '#767577' }}
          />
        <Text style={styles.themeText}>Dark</Text>
        </View>
      </View>

      {/* Text to Speech Button */}
      <TouchableOpacity style={[styles.button, styles.textToSpeechButton]} onPress={() => {
    speakText('Enable Text to Speech button pressed')}}>
        <Text style={styles.buttonText}>Enable Text to Speech</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const createStyles = (fontScale:number, isDarkTheme:boolean) => {
  return (
    StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: -40,
        backgroundColor: isDarkTheme? '#151718' : '#EAEAEA',
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
        fontSize: 30 * fontScale,
        lineHeight: 30 * fontScale * 1.2,
        fontWeight: 'bold',
        color: isDarkTheme ? 'white' : 'black',
      },
      title: {
        fontSize: 32 * fontScale,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 40 * fontScale,
        letterSpacing: 2,
        marginBottom: 30,
        color: isDarkTheme ? 'white' : 'black',
      },
      box: {
        backgroundColor: isDarkTheme ? '#007BFF' : '#AAD4FF',
        padding: 20,
        borderRadius: 15,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
      },
      boxTitle: {
        fontSize: 24 * fontScale,
        lineHeight: 24 * fontScale * 1.2,
        fontWeight: 'bold',
        color: isDarkTheme ? 'white' : 'black',
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
        backgroundColor: isDarkTheme ? 'black' : 'white',
        paddingVertical: 10,
        paddingHorizontal: 0,
        borderRadius: 15,
        marginBottom: 10,
        marginHorizontal: 5,
        width: 70,
      },
      fontButtonText: {
        color: isDarkTheme ? 'white' : 'black',
        fontSize: 14 * fontScale,
        lineHeight: 14 * fontScale * 1.2,
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
        color: isDarkTheme ? 'white' : 'black',
        fontSize: 18 * fontScale,
        lineHeight: 18 * fontScale * 1.2,
        fontWeight: 'bold',
      },
      textToSpeechButton: {
        backgroundColor: isDarkTheme ? '#007BFF' : '#AAD4FF',
        width: '100%',
        paddingVertical: 25,
      },
      button: {
        backgroundColor: isDarkTheme ? 'black' : 'white',
        paddingVertical: 15,
        borderRadius: 15,
        marginTop: 20,
        width: '80%',
      },
      buttonText: {
        color: isDarkTheme ? 'white' : 'black',
        fontSize: 24 * fontScale,
        lineHeight: 24 * fontScale * 1.2,
        fontWeight: 'bold',
        textAlign: 'center',
      },
    })
  )
};
