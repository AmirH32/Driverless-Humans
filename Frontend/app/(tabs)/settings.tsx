import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Pressable, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TopBar } from '@/components/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // create the POST request body
      const requestBody = {
        email: email,
        password: password,
      };

      // Send POST request to backed /login endpoint
      const response = await fetch("http://127.0.0.1:5000/login",{
        method: "POST",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok){
        // TODO: ADD LOGIC IF LOGIN SUCCESSFUL
        console.log("Login successful");
      } else {
        // TODO: ADD LOGIC IF LOGIN FAILED
        console.log("Login failed", data.message);
      }
    } catch (error){
      // TODO: Possibly add logic to display frontend request error?
      console.error("Error during login, could not connect to server:", error);
    };
  };

  return (
    <ThemedView style={styles.container}>
      <TopBar/>
      <ThemedView style={styles.scrollableWindow}>
        <Pressable style={styles.settingsEntry}>
          <IconSymbol size={50} name="house.fill" color={'#000000'} /> 
          <ThemedText style={styles.entryText}>4 Volunteers Available</ThemedText>
        </Pressable>
        <Pressable style={styles.settingsEntry}>
          <IconSymbol size={50} name="house.fill" color={'#000000'} /> 
          <ThemedText style={styles.entryText}>4 Volunteers Available</ThemedText>
        </Pressable>
        <Pressable style={styles.settingsEntry}>
          <IconSymbol size={50} name="house.fill" color={'#000000'} /> 
          <ThemedText style={styles.entryText}>4 Volunteers Available</ThemedText>
        </Pressable>
        <Pressable style={styles.settingsEntry}>
          <IconSymbol size={50} name="house.fill" color={'#000000'} /> 
          <ThemedText style={styles.entryText}>4 Volunteers Available</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflowY: 'scroll',
  },
  scrollableWindow: {
    borderRadius: 2,
    borderColor: 'grey',
    overflowY: 'scroll',// ! this one actually should be lol
    maxHeight: '80vh',
  },
  settingsEntry: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '##36b7ff',
    height: 100,

    
  },
  entryText: {
    color: '#FFFFFF',
    fontSize: 25,

  }
}); 