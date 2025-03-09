import React from 'react';
import { TouchableOpacity, StyleSheet, Text, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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

        {/* TODO: Text on information about where users can find help and support, such as FAQs and a feedback form */}
        <ThemedText style={styles.text}>
          Feedback Form:{"\n"}
          https://forms.gle/5Ps2da5HJRTsnYzr6
        </ThemedText>
        <ThemedText style={styles.text}>
          Assistance Request Form:{"\n"}
          https://forms.gle/PQcnp5zGqTpkfDXy5
        </ThemedText>
        <ThemedText style={styles.text}>
          FAQs:{"\n"}
          https://docs.google.com/document/d/1sz4OI-C5nLqZnQLJcRFlt5BmmMdRktHRGIOS4u6KyP4/edit?usp=sharing
        </ThemedText>
        <ThemedText style={styles.text}>
          Contact us!{"\n"}
          placeholder@email.com
        </ThemedText>

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
});