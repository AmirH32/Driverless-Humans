import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Pressable, Text} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SearchBar } from 'react-native-screens';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TopBar } from '@/components/TopBar';

export default function LoginScreen() {
  const [busstop, setBusStop] = useState('');
  const color = '#000000';

  const handleSearch = () => {
      const requestBody = {
        busstop: busstop, /* I need to go through and find all the protocol details or ask shaun */
      };
    // Implement login logic here
    console.log('Searching for: ', busstop);
  };
  const bookBus = () => {
    console.log('bus booking, not yet passing an ID yet, need to have collecion of data first')
  };
  const getTimetables = () => {
    try {
      // create the POST request body
      const src_stop = "source";
      const dst_stop = "dest"; // TODO these should be passed from the prev page


      // Send POST request to backed /login endpoint
      // const response = await fetch(`http://127.0.0.1:5000/timetables?stop_id=${src_stop}`);
      // await means the program will background and do what it needs to do and carry on once its done,
      // TODO shaun planning to add dest stop

      // const data = await response.json(); // ! This is what will happen, but using dummies for now
      const data = [{
        "arrival_time":"2025-02-25T11:06:44.540073Z",
        "ramp_type":"MANUAL",
        "route_id":"U1",
        "route_name":"U1",
        "seats_empty":1,
        "vehicle_id":"WHIP-MX23LRV"
      },{
        "arrival_time":"2025-02-25T11:06:31.409276Z",
        "ramp_type":"MANUAL",
        "route_id":"U2",
        "route_name":"U2",
        "seats_empty":2,
        "vehicle_id":"WHIP-MX23LRZ"
      },{
        "arrival_time":"2025-02-25T11:06:31.409276Z",
        "ramp_type":"MANUAL",
        "route_id":"U2",
        "route_name":"U2",
        "seats_empty":2,
        "vehicle_id":"WHIP-MX23LRZ"
      }];
      const getRampType = (dat: { [key: string]: string | number }) => {
        if(dat["ramp_type"]=="MANUAL"){
          return "Manual ramp";
        } else if (dat["ramp_type"]=="AUTO"){
          return "Auromatic ramp";
        }
      }

      function getWaitingTime(timestamp: string) {
        // TODO: Is there some way to make this a live updating variable??
        const givenDate = new Date(timestamp);
        const currentDate = new Date(); // Current time
    
        const diffMilliseconds = currentDate.getTime() - givenDate.getTime();
        const diffSeconds = Math.floor(diffMilliseconds / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
    

        return (((diffDays*24)+diffHours)*60)+diffMinutes;
      }



      // if (response.ok){ // why not
      //   console.log("Request succesful");
      // } else {
      //   console.error("Request failed, response did not return succesfully");
      // }
      var busses = [];
      // For ech thing in the lsit
      for (let dat of data){
        busses.push(
          <Pressable 
            style={styles.busview_container}
            onPress={bookBus} 
          >  {/* TODO add a reservation tag for which bus, comes with automating it ig */}
            <Text style={styles.busview_busNumber}>{dat["route_name"]}</Text>
            <View style={styles.busview_infoContainer}>
              <IconSymbol size={50} name="clock" color={color} />
              <Text>{getWaitingTime(dat["arrival_time"])} min</Text>
            </View>
            <View style={styles.busview_infoContainer}>
              <IconSymbol size={50} name="testing123" color={color} />
              <Text>{dat["seats_empty"]} seat free</Text>
            </View>
            <View style={styles.busview_infoContainer}>
              <IconSymbol size={50} name="house.fill" color={color} />
              <Text>{getRampType(dat)}</Text>
            </View>
          </Pressable> 
          );
        
      }
      return busses;


      // Out put the style correctly with the values inserted
    } catch (error){
      console.error("Error during stops fetch, could not connect to server:", error);
    };
    
  };

  return (
    <ThemedView style={styles.wide_container}>
    <TopBar></TopBar>
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
      > <IconSymbol size={50} name="lookup" color={color} /> </Pressable> {/* TODO get a search  */}
      </View>

      {getTimetables()} 
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