import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, TextInput, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import api from "@/services/api"; // Import the Axios instance
import { router } from "expo-router";

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      });

      if (response.data.success) {
        alert("Signup Successful: " + response.data.message);
        // Redirect to login page after successful signup
        router.push("/login"); 
      } else {
        alert("Signup Failed: " + response.data.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Error during signup: " + error.message);
      } else if ((error as any)?.response?.data?.message) {
        alert("Signup Failed: " + (error as any).response.data.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image source={require('../../assets/images/council_logo.png')} style={styles.topLeftImage} />
      <Image source={require('../../assets/images/buses.png')} style={styles.mainImage} />

      <TextInput style={styles.input} placeholder="Enter Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Enter Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Enter Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Re-enter Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign up</Text>
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
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 20,
    paddingHorizontal: 100,
  },
});
