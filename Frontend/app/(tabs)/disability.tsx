import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import api from "@/services/api";// Adjust the import path as necessary
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios, { AxiosError } from 'axios';
import { useFontSize } from '@/contexts/FontSizeContext';
import { speakText } from '@/services/ttsUtils';


export default function DisabilityScreen() {
  const router = useRouter();

  // Font scaling
  const {fontScale, setFontScale} = useFontSize();
  const styles = createStyles(fontScale);

  const handleViewDocument = async () => {
    try {
      const response = await api.get("/view_pdf", {
        responseType: 'blob', // Important to get the file as a binary blob
      });
      
    // Create a URL for the binary blob
    const fileURL = window.URL.createObjectURL(new Blob([response.data]));

    // Open the file in a new browser tab
    window.open(fileURL, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
    }
  };

  
  const handleUploadDocument = async () => {
    try {
      // Open the document picker for PDFs
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true, // Ensures file is accessible
      });
  
      // Handle user cancellation
      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("User canceled document picker");
        return;
      }
  
      const file = result.assets[0];
  
      // Validate file selection
      if (!file.uri || !file.name || !file.mimeType) {
        console.error("Invalid file selected:", file);
        return;
      }
  
      // Convert file URI to Blob
      const response = await fetch(file.uri);
      const blob = await response.blob();
  
      // Create FormData and append the file (no need for cast as any in this case)
      const formData = new FormData();
      formData.append("file", blob, file.name); // Correct syntax for FormData
  
      // Send to backend using your custom axios instance
      const uploadResponse = await api.post("/upload_pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("PDF uploaded successfully:", uploadResponse.data);
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Error: There was an issue uploading your document.");
    }
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
        onPress={() => {handleViewDocument(); speakText('View current disability document pressed')}}
      >
        <Text style={styles.buttonText}>View Current Document</Text>
      </TouchableOpacity>

      {/* Upload New Document Button */}
      <TouchableOpacity
        style={[styles.button, styles.uploadButton]}
        onPress={() => {handleUploadDocument(); speakText('Upload disability document pressed');}}
      >
        <Text style={styles.buttonText}>Upload New Document</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const createStyles = (fontScale:number) => {
  return (
    StyleSheet.create({
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
        fontSize: 30 * fontScale,
        lineHeight: 30 * fontScale * 1.2,
        fontWeight: 'bold',
        color: '#5D5D5D',
      },
      title: {
        fontSize: 32 * fontScale,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 40 * fontScale,
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
        fontSize: 24 * fontScale,
        lineHeight: 24 * fontScale * 1.2,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      viewButton: {
        paddingHorizontal: 85,
      },
      uploadButton: {
        paddingHorizontal: 90,
      },
    })
  )
};
