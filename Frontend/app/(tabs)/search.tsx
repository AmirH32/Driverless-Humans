import React, { useState } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import AutocompleteInput from "@/components/AutocompleteSearchBar";
// import CookieManager from '@react-native-cookies/cookies';

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
    }
  };

  // const cookies = CookieManager.get("http://127.0.0.1:5000");
  // console.log(cookies);

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
