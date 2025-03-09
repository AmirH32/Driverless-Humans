import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function DisabilityScreen() {
  const router = useRouter();

  const handleViewDocument = () => {
    console.log('View Current Document button clicked');
  };

  const handleUploadDocument = () => {
    console.log('Upload New Document button clicked');
  };

  return (
    <ThemedView style={styles.container}>
        <TouchableOpacity 
            style={styles.crossButton}
            onPress={() => router.push('/settings')}
            >
            <Text style={styles.crossText}>✕</Text>
        </TouchableOpacity>

      <ThemedText style={styles.title}>Disability Info</ThemedText>

      {/* View Current Document Button */}
      <TouchableOpacity
        style={[styles.button, styles.viewButton]}
        onPress={handleViewDocument}
      >
        <Text style={styles.buttonText}>View Current Document</Text>
      </TouchableOpacity>

      {/* Upload New Document Button */}
      <TouchableOpacity
        style={[styles.button, styles.uploadButton]}
        onPress={handleUploadDocument}
      >
        <Text style={styles.buttonText}>Upload New Document</Text>
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
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  viewButton: {
    paddingHorizontal: 85,
  },
  uploadButton: {
    paddingHorizontal: 90,
  },
});