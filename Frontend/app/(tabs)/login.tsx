import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, TextInput, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { router } from "expo-router";
import api from "@/services/api";
import axios, { AxiosError } from 'axios';
import { useFontSize } from '@/contexts/FontSizeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { speakText } from '@/services/ttsUtils';

export default function LoginScreen() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Font scaling
  const {fontScale, setFontScale} = useFontSize();
  const styles = createStyles(fontScale);
  const linkDocumentToUser = async () => {
    try {
      // Retrieve the TempUserID from AsyncStorage
      const tempUserId = await AsyncStorage.getItem('temp_user_id');
  
      if (tempUserId) {
        // Send TempUserID to the backend to link the document to the logged-in user
        const response = await api.post('/link_document_to_user', {tempUserId})
  
        if (response.data.success) {
          console.log("Document successfully linked to user");
          // Optionally, remove TempUserID from AsyncStorage after linking
          await AsyncStorage.removeItem('temp_user_id');
        } else {
          console.error('Error linking document:', response.data.error);
        }
      } else {
        console.log('No TempUserID found, skipping linking');
      }
    } catch (error) {
      console.error('Error during linking document:', error);
    }
  };

  const handlePress = async () => {
    try {
      const requestBody = { email, password };
      const response = await api.post("/login", requestBody);
      if (response.data.success) {
        const accessToken = response.data.access_token;  // Backend returns access token
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        alert("Login successful");
        try {
          linkDocumentToUser();
          const userInfoResponse = await api.get("/user-info");
          const userRole = userInfoResponse.data.role;
          
          // Store role in localStorage or context
          localStorage.setItem("userRole", userRole);
          if (userRole == "Disabled") {
            router.push("/search");
          } else if (userRole == "Volunteer") {
            router.push("/timetables");
          } else {
            router.push("/home");
          }
        } catch (infoError) {
          console.error("Error fetching user info:", infoError);
          router.push("/home");
        }
      } else {
        alert("Login failed: " + response.data.message);
      }
    } catch (error: unknown) {
      // Handle Axios error
      if (axios.isAxiosError(error)) {
        // Check if error.response exists and contains a message
        if (error.response && error.response.data && error.response.data.message) {
          alert("Login failed: " + error.response.data.message);
        } else {
          // Handle error without message (e.g., network issues)
          alert("Login failed: Unknown error from the server.");
        }
      } else if (error instanceof Error) {
        // Generic JS error
        alert("Error during login: " + error.message);
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

      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        placeholderTextColor="#D0E1FF" 
        value={email}
        onChangeText={setEmail}
        onFocus={() => speakText('Enter Email field')}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        placeholderTextColor="#D0E1FF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        onFocus={() => speakText('Enter Password field')}
      />
      
      <TouchableOpacity
        style={[styles.loginButton]}
        onPress={() => {speakText('Log in button clicked'); handlePress();}}
      >
        <Text style={styles.buttonText}>Login</Text>
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
        fontSize: 15 * fontScale,
        lineHeight: 15 * fontScale * 1.2,
        height: 40,
        backgroundColor: '#007BFF',
        color: 'white',
        borderRadius: 8,
        paddingLeft: 10,
        marginBottom: 10,
        width: '80%',
      },
      buttonText: {
        color: 'white',
        fontSize: 20 * fontScale,
        lineHeight: 20 * fontScale * 1.2,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      loginButton: {
        backgroundColor: '#00BF63',
        paddingVertical: 12,
        borderRadius: 15,
        marginTop: 20,
        paddingHorizontal: 100,
      },
    })
  )
};
