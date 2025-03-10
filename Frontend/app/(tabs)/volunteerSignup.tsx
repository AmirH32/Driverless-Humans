import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, TextInput, Image, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import api from "@/services/api"; // Import the Axios instance
import { router } from "expo-router";
import axios, { AxiosError } from 'axios';
import { useFontSize } from '@/contexts/FontSizeContext';

export default function VolunteerSignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const hasDisability = false; 

  // Font scaling
  const {fontScale, setFontScale} = useFontSize();
  const styles = createStyles(fontScale);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Error: All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Error: Passwords do not match.");
      return;
    }

    try {
      const response = await api.post("/register", {
        name,
        email,
        password,
        hasDisability,
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

      <TextInput style={styles.input} placeholder="Enter Name" placeholderTextColor="#D0E1FF" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Enter Email" placeholderTextColor="#D0E1FF" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Enter Password" placeholderTextColor="#D0E1FF" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Re-enter Password" placeholderTextColor="#D0E1FF" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      {/* Signup Button */}
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
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
