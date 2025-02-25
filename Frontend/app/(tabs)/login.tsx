import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, TextInput, Button, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function LoginScreen() {
  const handlePress = (buttonType: string) => {
    console.log(`${buttonType} Pressed!`);
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const requestBody = { email, password };

      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful");
      } else {
        console.log("Login failed", data.message);
      }
    } catch (error) {
      console.error("Error during login, could not connect to server:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image source={require('../../assets/images/council_logo.png')} style={styles.topLeftImage} />
      <Image source={require('../../assets/images/buses.png')} style={styles.mainImage} />

      {/* <ThemedText style={styles.title}>Login</ThemedText> */}
      
      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <TouchableOpacity
        style={[styles.loginButton]}
        onPress={() => handlePress('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
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
  loginButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 20,
    paddingHorizontal: 100,
  },
});