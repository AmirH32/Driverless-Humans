import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, TextInput, Image, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import api from "@/services/api"; // Import the Axios instance
import { router } from "expo-router";
import axios, { AxiosError } from 'axios';
import { useFontSize } from '@/contexts/FontSizeContext';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { speakText } from '@/services/ttsUtils';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [docUploaded, setDocUploaded] = useState(false);
  const hasDisability = true; 

  // Font scaling
  const {fontScale, setFontScale} = useFontSize();
  const styles = createStyles(fontScale);

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
      const uploadResponse = await api.post("/upload_pdf_temp", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      
      // Check the response for the TempUserID (make sure backend returns it)
      if (uploadResponse.data && uploadResponse.data.temp_user_id) {
        const tempUserId = uploadResponse.data.temp_user_id;
        
        // Store this TempUserID for later use (you can use AsyncStorage or React Context as discussed)
        await AsyncStorage.setItem('temp_user_id', tempUserId);
        alert("Successfully uploaded document!")
        setDocUploaded(true);
        
      } else {
        console.error('TempUserID not found in response:', uploadResponse.data);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Error: There was an issue uploading your document.");
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Error: All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Error: Passwords do not match.");
      return;
    }

    if (!docUploaded) {
      alert("Error: Please upload document as supporting evidence");
      return;
    }

    try {
      const tempUserId = await AsyncStorage.getItem('temp_user_id');

      const response = await api.post("/register", {
        name,
        email,
        password,
        hasDisability,
        tempUserId
      });

      if (response.data.success) {
        alert("Signup Successful: " + response.data.message);
        router.push("/login"); 
      } else {
        alert("Signup Failed: " + response.data.message);
      }
    } catch (error: unknown) {
      // Handle Axios error
      if (axios.isAxiosError(error)) {
        // Check if error.response exists and contains a message
        if (error.response && error.response.data && error.response.data.message) {
          alert("Registration failed: " + error.response.data.message);
        } else {
          // Handle error without message (e.g., network issues)
          alert("Registration failed: Unknown error from the server.");
        }
      } else if (error instanceof Error) {
        // Generic JS error
        alert("Error during Registration: " + error.message);
      } else {
        // Fallback for unknown errors
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image source={require('../../assets/images/council_logo.png')} style={styles.topLeftImage} />

      <TouchableOpacity 
        style={styles.crossButton}
        onPress={() => {router.push('/home')}}
      >
        <Text style={styles.crossText}>✕</Text>
      </TouchableOpacity>

      <Image source={require('../../assets/images/buses.png')} style={styles.mainImage} />

      <TextInput style={styles.input} placeholder="Enter Name" placeholderTextColor="#D0E1FF" value={name} onChangeText={setName} onFocus={() => speakText('Enter name field')}/>
      <TextInput style={styles.input} placeholder="Enter Email" placeholderTextColor="#D0E1FF" value={email} onChangeText={setEmail} onFocus={() => speakText('Enter email field')}/>
      <TextInput style={styles.input} placeholder="Enter Password" placeholderTextColor="#D0E1FF" secureTextEntry value={password} onChangeText={setPassword} onFocus={() => speakText('Enter Password field')}/>
      <TextInput style={styles.input} placeholder="Re-enter Password" placeholderTextColor="#D0E1FF" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} onFocus={() => speakText('Enter Confirm password field')}/>

      {/* Checkbox */}
      {/* <View style={styles.checkboxWrapper}>
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setHasDisability(!hasDisability)}>
          <View style={[styles.checkbox, hasDisability && styles.checkedCheckbox]} />
          <Text style={styles.checkboxText}>I have a disability</Text>
        </TouchableOpacity>
      </View> */}

      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={() => {speakText('Upload document for disability evidence clicked'); handleUploadDocument()}}> 
        <Text style={styles.buttonText}>Upload Disability Evidence</Text>
      </TouchableOpacity>

      {/* Signup Button */}
      <TouchableOpacity style={styles.signupButton} onPress={() => {speakText('Registration button clicked'); handleSignup()}}>
        <Text style={styles.buttonText}>Sign up</Text>
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
        top: 130,
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
      topLeftImage: {
        position: 'absolute',
        top: 65,
        left: 0,
        width: 200,
        height: 100,
        resizeMode: 'contain',
      },
      mainImage: {
        width: 390,
        height: 280,
        marginBottom: 0,
        resizeMode: 'contain',
      },
      input: {
        height: 40,
        backgroundColor: '#007BFF',
        color: 'white',
        borderRadius: 8,
        paddingLeft: 10,
        marginBottom: 10,
        width: '80%',
        fontSize: 15 * fontScale,
        lineHeight: 15 * fontScale * 1.2,
      },
      // checkboxWrapper: {
      //   backgroundColor: '#FFA500',
      //   borderRadius: 15,
      //   paddingVertical: 10,
      //   paddingHorizontal: 20,
      //   marginTop: 10,
      //   alignItems: 'center',
      //   width: '80%',
      // },
      // checkboxContainer: {
      //   flexDirection: 'row',
      //   alignItems: 'center',
      // },
      // checkbox: {
      //   width: 20,
      //   height: 20,
      //   borderWidth: 2,
      //   borderColor: '#007BFF',
      //   borderRadius: 4,
      //   marginRight: 10,
      //   backgroundColor: 'white',
      // },
      // checkedCheckbox: {
      //   backgroundColor: '#007BFF',
      // },
      // checkboxText: {
      //   fontSize: 16,
      //   color: 'white',
      // },
      uploadButton: {
        backgroundColor: '#FFA500',
        paddingVertical: 12,
        borderRadius: 15,
        marginTop: 10,
        paddingHorizontal: 37,
      },
      buttonText: {
        color: 'white',
        fontSize: 16 * fontScale,
        lineHeight: 16 * fontScale * 1.2,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      signupButton: {
        backgroundColor: '#00BF63',
        paddingVertical: 12,
        borderRadius: 15,
        marginTop: 20,
        paddingHorizontal: 100,
      },
    })
  )
};
