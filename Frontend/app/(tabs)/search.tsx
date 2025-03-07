import React, { useState } from "react";
import { Text, View, StyleSheet, Button, Alert, Image, Pressable, ImageBackground } from "react-native";
import AutocompleteInput from "@/components/AutocompleteSearchBar";
// import CookieManager from '@react-native-cookies/cookies';

import { TopBar } from '@/components/TopBar';
type Stop = {
  id: string;
  name: string;
  street: string;
};

export default function SearchScreen() {
  const [origin, setOrigin] = useState<Stop | null>(null);
  const [destination, setDestination] = useState<Stop | null>(null);

  const handleSubmit = () => {
    if (origin && destination) {
      alert("Navigating to Schedule from " + origin.id + " to " + destination.id);
      // TODO see how agrim has done buttons, same principle i think
    }
  };

  // const cookies = CookieManager.get("http://127.0.0.1:5000");
  // console.log(cookies);

  return (
    <ImageBackground
      source={require('@/assets/images/camb_map.png')}
      style={styles.backingImage}
    >
    <View style={styles.wide_container}>
      <TopBar></TopBar>
    <View style={styles.container}>
      <View style={styles.upper_container}>
      {/* <Image 
        source={require('@/assets/images/camb_map.png')} 
        style={styles.backingImage} 
      /> */}
        <View style={styles.inputbox}>
          <AutocompleteInput label="Origin" onSelect={setOrigin} />
        </View>
        <View style={styles.inputbox}>
          <AutocompleteInput label="Destination" onSelect={setDestination} />
        </View>

      </View>
      
      <View style={styles.buttonContainer}>
        <Pressable style={styles.submitButton} onPress={handleSubmit}>Find Routes </Pressable>
      </View>
      </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wide_container: {
    height: '100vh',
   marginTop: 45,// idrk why this was needs, feels like the fault of the background image maybe?
  },
  container: {
    flex: 1,
    justifyContent: `space-between`,
    padding: 12,
    alignItems: 'center',
  },
  upper_container: {
  },
  buttonContainer: {
    marginTop: 20,
    width: '70%',
    height: 100,
  },
  inputbox: {
    borderWidth: 1,
    margin: 20,
    backgroundColor: '#d9d9d9',
    borderRadius: 25,
  },
  submitButton: {// TODO this style has sponteneously broken idrk
    height: 70,
    backgroundColor: '#7ed957',
    borderRadius: 25,
    textAlign: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial',
    fontSize: 30,
  },
  backingImage: { 

    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    resizeMode: 'cover',
    width: '100vw',
    height: '100vw',
  },
});
