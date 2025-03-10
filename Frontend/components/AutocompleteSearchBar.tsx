// Adapted from https://www.youtube.com/watch?v=Dp8cQU2OcFU and https://github.com/JeremyPersing/airbnbtut/blob/master/screens/AutocompleteScreen.tsx

import React, { useState } from "react";
import { Text, StyleSheet, TextInput, FlatList, Pressable, View } from "react-native";
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import api from "@/services/api";
import { useFontSize } from "@/contexts/FontSizeContext";
import { speakText } from '@/services/ttsUtils';

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
  const {fontScale, setFontScale} = useFontSize();
  const styles = createStyles(fontScale);

  const onChangeText = async (text: string) => {
    setInput(text);
    if (text.length > 2) {
      try {
        const response = await api.get("/autocomplete", { params: { input: text, limit: 5 } });
        console.log(response);
        if (response.status === 200) {
          setData(response.data);
        }
      } catch (error) {
        // Using type assertion to treat the error as AxiosError
        if ((error as any)?.response?.status === 401) {
          alert("You are not authorised, please login. Going back to home screen...");
          router.push("/login");  // Redirect to login screen if 401 error
        } else {
          // Handle other errors here (e.g., network issues, server errors)
          console.error("Error occurred:", error);
          alert("An error occurred while fetching autocomplete data.");
        }
      }
    }
  };

  return (
    <View style={styles.totalContainer}>
    <View style={styles.main_container}>
      <IconSymbol size={50} name="map.pin" color={"#0000FF"} />
      <TextInput
        onFocus={() => speakText('Enter location field')}
        onChangeText={onChangeText}
        value={input}
        style={styles.input}
        placeholder={label}
      />
    </View>
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

const createStyles = (fontScale:number) => {
  return (
    StyleSheet.create({
      totalContainer: {
        paddingTop: 15,
        paddingBottom: 15,

      },
      main_container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly'
      },
      searchLabel: {
        marginLeft: 12,
        marginVertical: 5,
        fontSize: 12 * fontScale,
        lineHeight: 12 * fontScale * 1.2,
        width: '100%',
      },
      input: {
        height: 40,
        fontSize: 15 * fontScale,
        lineHeight: 15 * fontScale * 1.2,
        marginHorizontal: 12,
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
        fontSize: 12 * fontScale,
        lineHeight: 12 * fontScale * 1.2,
      },
    })
  )
};
