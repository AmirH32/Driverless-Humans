import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TopBar } from '@/components/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function VolunteerConfirmedScreen() {
  const router = useRouter();

  // Track if the booking has been confirmed
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Handle confirming the booking
  const handleConfirm = async () => {
    setIsConfirmed(true);
    // TODO: Send an API request to confirm the booking
    alert("Booking confirmed!");
  };

  // Handle cancelling the booking
  const handleCancel = async () => {
    if (isConfirmed) {
      // Unpress the button
      setIsConfirmed(false);

      // TODO: API request to cancel the booking
      alert("Booking cancelled.");

    } else {
      // If booking wasn't confirmed, just return to timetables
      router.push('/timetables');
    }
  };

  master_data = {
    seats_available: 1,
    volounteers_available: 4,
    minutes_wait: 30,
  }// TODO using the API, this need to be linked
  
  const getData = async () => {
    try {
      
      const src_stop_id = "0500CCITY423";
      const dst_stop_id = "0500CCITY523"; // TODO these should be passed from the prev page

      const response = await fetch(`http://127.0.0.1:5000/timetables?origin_id=${src_stop_id}&destination_id=${dst_stop_id}`);
      const data = await response.json(); // ! This is what will happen, but using dummies for now
      console.log(data);
      master_data["minutes_wait"] = data["arrival_min"]
      // TODO Modify the dict
    } catch (error) {
      console.error("Error during stops fetch, could not connect to server:", error);
    }
  };



  return (
    <ThemedView style={styles.container}>
      <TopBar/>
      <ThemedText type="title" style={{color: '#000000'}}>Booking Confirmed!</ThemedText>
      <Image source={require('@/assets/images/camb_map.png')} style={styles.mapimg}/>
      <View style={styles.infoView}>
        <View style={styles.infoEntry}>
          <IconSymbol size={50} name="house.fill" color={'#000000'} /> 
          <Text style={styles.infoText}>{master_data["seats_available"]} Seat Available</Text>
        </View>
        <View style={styles.infoEntry}>
          <IconSymbol size={50} name="house.fill" color={'#000000'} /> 
          <Text style={styles.infoText}>{master_data["volounteers_available"]} Volunteers Available</Text>
        </View>
        <View style={styles.infoEntry}>
          <IconSymbol size={50} name="clock" color={'#000000'} /> 
          <Text style={styles.infoText}>{master_data["minutes_wait"]} Minute wait</Text>
        </View>
      </View>

      {/* Confirm Volunteering Button */}
      <Pressable 
        style={[styles.button_confirm, isConfirmed && styles.button_pressed]} 
        onPress={handleConfirm}
        disabled={isConfirmed}
      >
        <Text style={styles.buttonText}>
          {isConfirmed ? 'Confirmed!' : 'Confirm Volunteering?'}
        </Text>
      </Pressable>

      {/* Cancel Volunteering Button */}
      <Pressable 
        style={styles.button_cancel}
        onPress={handleCancel}
      >
        <Text style={styles.buttonText}>
          {isConfirmed ? 'Cancel Volunteering' : 'Cancel'}
        </Text>
      </Pressable>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
    color: '#000000',
  },
  mapimg: {
    width: 200,
    height: 200,
    marginTop: 10,
    marginBottom: 20,
  },
  infoView: {
    backgroundColor: '#39b7ff',
    borderRadius: 25,
    padding: 15,
    marginBottom: 20,
    width: '90%',
  },
  infoEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    fontSize: 18,
    color: '#000000',
    marginLeft: 10,
  },
  button_confirm: {
    backgroundColor: '#03bf62',
    paddingVertical: 15,
    borderRadius: 20,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  button_pressed: {
    backgroundColor: '#006c43',
  },
  button_cancel: {
    backgroundColor: '#ff3130',
    paddingVertical: 15,
    borderRadius: 20,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});