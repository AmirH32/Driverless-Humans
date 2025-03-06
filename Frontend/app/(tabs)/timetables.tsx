import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, Pressable, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TopBar } from '@/components/TopBar';

export default function LoginScreen() {
  const [busstop, setBusStop] = useState('');
  const [busses, setBusses] = useState([]);  // State for storing bus data
  const color = '#000000';

  const handleSearch = () => {
    console.log('Searching for: ', busstop);
  };

  const bookBus = () => {
    console.log('bus booking, not yet passing an ID yet, need to have collection of data first');
  };

  const getTimetables = async () => {
    try {
      
      const src_stop = "0500CCITY423";
      const dst_stop = "0500CCITY523"; // TODO these should be passed from the prev page

      const response = await fetch(`http://127.0.0.1:5000/timetables?origin_id=${src_stop}&destination_id=${dst_stop}`);
      const data = await response.json(); // ! This is what will happen, but using dummies for now
      console.log(data);

      const getRampType = (dat) => {
        return dat["ramp_type"] === "MANUAL" ? "Manual ramp" : "Automatic ramp";
      };

      const bussesComponents = data.map((dat, index) => (
        <Pressable
          key={index}
          style={styles.busview_container}
          onPress={bookBus}
        >
          <Text style={styles.busview_busNumber}>{dat["route_name"]}</Text>
          <View style={styles.busview_infoContainer}>
            <IconSymbol size={50} name="clock" color={color} />
            <Text>{dat["arrival_min"]} min</Text>
          </View>
          <View style={styles.busview_infoContainer}>
            <IconSymbol size={50} name="testing123" color={color} />
            <Text>{dat["seats_empty"]} seat(s) free</Text>
          </View>
          <View style={styles.busview_infoContainer}>
            <IconSymbol size={50} name="house.fill" color={color} />
            <Text>{getRampType(dat)}</Text>
          </View>
        </Pressable>
      ));

      setBusses(bussesComponents);  // Update state with bus components
    } catch (error) {
      console.error("Error during stops fetch, could not connect to server:", error);
    }
  };

  // Fetch timetables when the component mounts
  useEffect(() => {
    getTimetables();
  }, []);

  return (
    <ThemedView style={styles.wide_container}>
      <TopBar />
      <ThemedView style={styles.container}>
        <View style={styles.searchbar_overal}>
          <TextInput
            style={styles.searchbar_search}
            placeholder="Enter Bus Stop..."
            value={busstop}
            onChangeText={setBusStop}
          />
          <Pressable
            style={styles.searchbar_button}
            onPress={handleSearch}
          >
            <IconSymbol size={50} name="lookup" color={color} />
          </Pressable>
        </View>
        {busses}
      </ThemedView>
    </ThemedView>
  );
}



const styles = StyleSheet.create({
  wide_container: {
    height: '100vh',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    overflowY: 'scroll',
    height: 100,
  },
  searchbar_overal: {
    maxHeight: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 25,
    paddingLeft: 8,
    borderRadius: 40,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchbar_search: {
    borderRadius: 32,
    height: 84,
    fontSize: 25,

  },
  searchbar_button: {
    borderRadius: 32,
    height: 84,
  },
  busview_container: {
    height: 160,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#39b7ff',
    borderRadius: 30,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-evenly'


  },
  busview_busNumber: {
    fontSize: 50,
  },
  busview_infoContainer: {
    alignItems: 'center',

  },
});