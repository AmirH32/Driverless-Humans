import React, { useState } from "react";
<<<<<<< HEAD
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import AutocompleteInput from "@/components/AutocompleteSearchBar";
// import CookieManager from '@react-native-cookies/cookies';

=======
import { Text, View, StyleSheet, Button, Alert, Image, Pressable, ImageBackground } from "react-native";
import AutocompleteInput from "@/components/AutocompleteSearchBar";
// import CookieManager from '@react-native-cookies/cookies';

import { TopBar } from '@/components/TopBar';
>>>>>>> creating-timetable-layout
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
<<<<<<< HEAD
=======
      // TODO see how agrim has done buttons, same principle i think
>>>>>>> creating-timetable-layout
    }
  };

  // const cookies = CookieManager.get("http://127.0.0.1:5000");
  // console.log(cookies);

  return (
<<<<<<< HEAD
    <View style={styles.container}>
      <AutocompleteInput label="Origin" onSelect={setOrigin} />
      <AutocompleteInput label="Destination" onSelect={setDestination} />

      {origin && (
        <View>
          <Text>Origin: {origin.name}</Text>
          <Text>Street: {origin.street}</Text>
        </View>
      )}

      {destination && (
        <View>
          <Text>Destination: {destination.name}</Text>
          <Text>Street: {destination.street}</Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button onPress={handleSubmit} title="Submit" />
      </View>
    </View>
=======
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

        {origin && (
          <View>
            <Text>Origin: {origin.name}</Text>
            <Text>Street: {origin.street}</Text>
          </View>
        )}

        {destination && (
          <View>
            <Text>Destination: {destination.name}</Text>
            <Text>Street: {destination.street}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <Pressable style={styles.submitButton} onPress={handleSubmit}>Find Routes </Pressable>
      </View>
      </View>
      </View>
    </ImageBackground>
>>>>>>> creating-timetable-layout
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
  },
  buttonContainer: {
    marginTop: 20,
=======
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
>>>>>>> creating-timetable-layout
  },
});
