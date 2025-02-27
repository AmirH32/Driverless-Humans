// Adapted from https://www.youtube.com/watch?v=Dp8cQU2OcFU and https://github.com/JeremyPersing/airbnbtut/blob/master/screens/AutocompleteScreen.tsx

import React, { useState } from "react";
import { Text, StyleSheet, TextInput, FlatList, Pressable, View } from "react-native";
import api from "@/services/api";

type Stop = {
  id: string;
  name: string;
  street: string;
};

type AutocompleteInputProps = {
  label: string;
  onSelect: (item: Stop) => void;
};

export default function AutocompleteInput({ label, onSelect }: AutocompleteInputProps) {
  const [input, setInput] = useState<string>("");
  const [data, setData] = useState<Stop[]>([]);

  const onChangeText = async (text: string) => {
    setInput(text);
    if (text.length > 2) {
      try {
        // Use the api instance instead of fetch
        const response = await api.get(`/autocomplete?input=${text}&limit=${5}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching autocomplete data:", error);
        // The axios interceptor will automatically handle 401 errors
      }
    } else {
      // Clear results when input is too short
      setData([]);
    }
  };

  return (
    <View>
      <Text style={styles.searchLabel}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        value={input}
        style={styles.input}
        placeholder={label}
      />
      {input && data.length > 0 ? (
        <FlatList
          data={data}
          showsVerticalScrollIndicator={true}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
              onPress={() => {
                onSelect(item);
                setInput(item.name);
                setData([]);
              }}
            >
              <View style={styles.itemContainer}>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemSubtitle}>{item.street}, {item.id}</Text>
                </View>
              </View>
            </Pressable>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchLabel: {
    marginLeft: 12,
    marginVertical: 5,
    fontSize: 12,
  },
  input: {
    height: 40,
    marginHorizontal: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderColor: 'gray',
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  itemTextContainer: {
    marginLeft: 10,
    flexShrink: 1,
  },
  itemTitle: {
    fontWeight: "700",
  },
  itemSubtitle: {
    fontSize: 12,
  },
});
