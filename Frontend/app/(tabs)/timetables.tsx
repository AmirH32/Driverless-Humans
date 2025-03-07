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

  const backToEdit = () => {
    alert("This button should link back to the origin/ desitination page")
  };

  const bookBus = (srcStop, dstStop, vechileBookingID) => {
    const timee = new Date();
    alert("send booking from <" + srcStop + "> to <"+ dstStop+"> on vechicle <"+ vechileBookingID+"> at time <"+timee+">");

  };
  const src_stop_id = "0500CCITY423";
  const dst_stop_id = "0500CCITY523"; // TODO these should be passed from the prev page
  const src_stop_name = "name 1";
  const dst_stop_name = "name 2";

  const getTimetables = async () => {
    try {
      const dummy_data = [{
        "arrival_min": 12,
        "ramp_type": "MANUAL",
        "route_id": "U1",
        "route_name": "U1",
        "seats_empty": 1,
        "vehicle_id": "v0"
      }, {
        "arrival_min": 22,
        "ramp_type": "MANUAL",
        "route_id": "U2",
        "route_name": "U2",
        "seats_empty": 2,
        "vehicle_id": "v1"
      }];
      

      const response = await fetch(`http://127.0.0.1:5000/timetables?origin_id=${src_stop}&destination_id=${dst_stop}`);
      const data = await response.json(); // ! This is what will happen, but using dummies for now
      console.log(data);

      const getRampType = (dat) => {
        return dat["ramp_type"] === "MANUAL" ? "Manual ramp" : "Automatic ramp";
      };

      const getWaitingTime = (timestamp) => {
        const givenDate = new Date(timestamp);
        const currentDate = new Date();
        const diffMilliseconds = givenDate.getTime() - currentDate.getTime();
        const diffMinutes = Math.ceil(diffMilliseconds / (1000 * 60));
        return diffMinutes > 0 ? diffMinutes : 0;  // Prevent negative times
      };

      const bussesComponents = data.map((dat, index) => (
        <Pressable
          key={index}
          style={styles.busview_container}
          onPress={bookBus(src_stop, dst_stop, dat["vehicle_id"])}
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
        <View style={styles.editbar_overal}>
          <Pressable
            style={styles.editbar_button}
            onPress={backToEdit}
          >
            <IconSymbol size={70} name="arrow.left" color={color} />
          </Pressable>
          <Text>
            {src_stop_name} to {dst_stop_name}
          </Text>
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
  editbar_overal: {
    maxHeight: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 25,
    paddingLeft: 8,
    borderRadius: 40,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  editbar_search: {
    borderRadius: 32,
    height: 84,
    fontSize: 25,

  },
  editbar_button: {
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