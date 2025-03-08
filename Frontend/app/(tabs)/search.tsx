import React, { useState } from "react";
import { Text, View, StyleSheet, Pressable, ImageBackground } from "react-native";
import AutocompleteInput from "@/components/AutocompleteSearchBar";
import { useRouter } from 'expo-router';

import { TopBar } from '@/components/TopBar';
type Stop = {
  id: string;
  name: string;
  street: string;
};

export default function SearchScreen() {
  const router = useRouter();
  const [origin, setOrigin] = useState<Stop | null>(null);
  const [destination, setDestination] = useState<Stop | null>(null);

  const handleSubmit = () => {
    if (origin && destination) {
      alert("Navigating to Schedule from " + origin.id + " to " + destination.id);
      router.push(`/timetables?src_stop_id=${origin.id}&dst_stop_id=${destination.id}&src_stop_name=${origin.name}&dst_stop_name=${destination.name}`);
    }
  };  

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
        {/* origin && (
          <View>
            <Text>Origin: {origin.name}</Text>
            <Text>Street: {origin.street}</Text>
          </View>
        ) */}

        {/* destination && (
          <View>
            <Text>Destination: {destination.name}</Text>
            <Text>Street: {destination.street}</Text>
          </View>
        )*/ }

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
    justifyContent: `space-evenly`,
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
    boxShadow: '5 5',
    opacity: 1,
  },
  backingImage: { 

    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    resizeMode: 'cover',
    bottom: 0,
    height: '100vh',
  },
});
