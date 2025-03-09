import React, { useState } from "react";
import { Text, View, StyleSheet, Pressable, ImageBackground } from "react-native";
import AutocompleteInput from "@/components/AutocompleteSearchBar";
import { useRouter } from 'expo-router';
import { TopBar } from '@/components/TopBar';
import { speakText } from '@/services/ttsUtils';

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
        <TopBar />
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <View style={styles.inputbox}>
              <AutocompleteInput label="Origin" onSelect={setOrigin} />
            </View>
            <View style={styles.inputbox}>
              <AutocompleteInput label="Destination" onSelect={setDestination} />
            </View>
          </View>

          <Pressable style={styles.submitButton} onPress={()=>{speakText('Find Route button clicked') ;handleSubmit()}}>
            <Text style={styles.submitButtonText}>Find Routes</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wide_container: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -30, // Aligns content closer to the logo
  },
  inputContainer: {
    width: '100%',
    gap: 15, // Creates space between input boxes
  },
  inputbox: {
    borderWidth: 1,
    padding: 15,
    backgroundColor: '#d9d9d9',
    borderRadius: 25,
    width: '100%',
  },
  submitButton: {
    height: 60,
    backgroundColor: '#7ed957',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: '70%',
    marginTop: 20,
    minWidth: 250,
  },
  submitButtonText: {
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  backingImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover',
    height: '100%',
  },
});