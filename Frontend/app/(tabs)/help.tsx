import React from 'react';
import { TouchableOpacity, StyleSheet, Text, Image, Linking, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { speakText } from '@/services/ttsUtils';

export default function HelpScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
        <TouchableOpacity 
            style={styles.crossButton}
            onPress={() => router.push('/settings')}
            >
            <Text style={styles.crossText}>✕</Text>
        </TouchableOpacity>

        <ThemedText style={styles.title}>Help and Support</ThemedText>

        <ThemedText style={styles.text}>
          Contact us!{"\n"}
          as3520@cam.ac.uk
        </ThemedText>

        <Pressable style={styles.button} onPress={()=>{Linking.openURL("https://forms.gle/5Ps2da5HJRTsnYzr6"); speakText('Opening feedback form')}}>
          <ThemedText style={styles.buttonText}>
            Feedback Form
          </ThemedText>
        </Pressable>

        <Pressable style={styles.button} onPress={()=>{Linking.openURL("https://forms.gle/PQcnp5zGqTpkfDXy5"); speakText('Opening Assistance request form')}}>
          <ThemedText style={styles.buttonText}>
            Assistance Request Form
          </ThemedText>
        </Pressable>

        <Pressable style={styles.button} onPress={()=>{Linking.openURL("https://docs.google.com/document/d/1sz4OI-C5nLqZnQLJcRFlt5BmmMdRktHRGIOS4u6KyP4/edit?usp=sharing");speakText('Opening FAQ') }}>
          <ThemedText style={styles.buttonText}>
            FAQs
          </ThemedText>
        </Pressable>

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
  text: {
    fontSize: 24,
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
    marginBottom: 30,
    width: 300,
  },
  buttonText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});