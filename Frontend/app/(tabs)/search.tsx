// With reference from https://www.youtube.com/watch?v=Dp8cQU2OcFU
// https://github.com/JeremyPersing/airbnbtut/blob/master/screens/AutocompleteScreen.tsx

import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  View,
} from "react-native";

type Stop = {
  id: string;
  name: string;
  street: string;
};

export default function SearchScreen() {
  const [input, setInput] = useState<string>("");
  const [data, setData] = useState<Stop[]>([]);

  const onSelect = async (item: Stop) => {
    alert("option chosen: " + JSON.stringify(item));
  };

  const onChangeText = async (text: string) => {
    setInput(text);
    if (text.length > 2) {
        let response = await fetch(`http://127.0.0.1:5000/autocomplete?input=${text}&limit=${5}`);
        if (response) {
            let data: Stop[] = await response.json();
            if (data.length > 0) {
                setData(data);
            }
        }
    }
  };

  return (
    <View style={styles.container}>
        <Text style={styles.searchLabel}>Start your bus journey here:</Text>
        <TextInput onChangeText={onChangeText} value={input} style={styles.input} placeholder="Bus stop name"/>
        {input && data.length > 0 ? (
        <FlatList
            data={data}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
            <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                onPress={ () => onSelect(item) }
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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