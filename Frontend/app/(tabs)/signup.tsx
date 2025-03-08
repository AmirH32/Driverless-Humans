import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, TextInput, Image, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import api from "@/services/api"; // Import the Axios instance
import { router } from "expo-router";

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasDisability, setHasDisability] = useState(false);

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

      <TextInput style={styles.input} placeholder="Enter Name" placeholderTextColor="#D0E1FF" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Enter Email" placeholderTextColor="#D0E1FF" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Enter Password" placeholderTextColor="#D0E1FF" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Re-enter Password" placeholderTextColor="#D0E1FF" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      {/* Checkbox Container with Same Background Color as Upload Button */}
      <View style={styles.checkboxWrapper}>
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setHasDisability(!hasDisability)}>
          <View style={[styles.checkbox, hasDisability && styles.checkedCheckbox]} />
          <Text style={styles.checkboxText}>I have a disability</Text>
        </TouchableOpacity>
      </View>

      {/* Dummy Upload Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={() => alert("Upload feature coming soon!")}>
        <Text style={styles.buttonText}>Upload Disability Evidence</Text>
      </TouchableOpacity>

      {/* Signup Button */}
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
    backgroundColor: '#007BFF',
    color: 'white',
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 10,
    width: '80%',
  },
  checkboxWrapper: {
    backgroundColor: '#FFA500',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
    width: '80%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007BFF',
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: 'white',
  },
  checkedCheckbox: {
    backgroundColor: '#007BFF',
  },
  checkboxText: {
    fontSize: 16,
    color: 'white',
  },
  uploadButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    borderRadius: 15,
    marginTop: 10,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
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
});