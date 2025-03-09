import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TopBar } from '@/components/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import api from '@/services/api';

export default function ConfirmedScreen() {
  const router = useRouter();

  // Track if the booking has been confirmed
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [info, setInfo] = useState<JSX.Element | null>(null);
  const { StopID1, StopID2, BusID, Time, VolunteerCount } = useLocalSearchParams();
  
  // Handle confirming the booking
  const handleConfirm = async () => {
    const r = api.post("/delete_reservation");
    console.log("Confirm fetching data.")
    const response = api.post("/create_reservation", {StopID1, StopID2, BusID, Time, VolunteerCount: parseInt(VolunteerCount as string, 10)});
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsConfirmed(true);
    fetchData();
  };
  
  // Handle cancelling the booking
  const handleCancel = async () => {
    if (isConfirmed) {
      // Unpress the button
      setIsConfirmed(false);

      // TODO: API request to cancel the booking
      const response = api.post("/delete_reservation");
    } else {
      // If booking wasn't confirmed, just return to timetables
      router.push('/timetables');
    }
  };

  const fetchData = async () => {
    const response = await api.get('/see_reservation');
    const data = response.data.reservations;
    const infoComponents = (
      <View style={styles.infoView}>
        <View style={styles.infoEntry}>
          <IconSymbol size={50} name="house.fill" color={'#000000'} /> 
          <Text style={styles.infoText}>{data["street"]}</Text>
        </View>
        <View style={styles.infoEntry}>
          <IconSymbol size={50} name="house.fill" color={'#000000'} /> 
          <Text style={styles.infoText}>{data["seats_empty"]} Seat Available</Text>
        </View>
        <View style={styles.infoEntry}>
          <IconSymbol size={50} name="house.fill" color={'#000000'} /> 
          <Text style={styles.infoText}>{data["VolunteerCount"]} Volunteers Available</Text>
        </View>
        <View style={styles.infoEntry}>
          <IconSymbol size={50} name="clock" color={'#000000'} /> 
          <Text style={styles.infoText}>{data["arrival_min"]} Minute wait</Text>
        </View>
      </View>
    )
    setInfo(infoComponents);
  };

  useEffect(() => {
    if (isConfirmed) {
      console.log("Effect fetching data.")
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isConfirmed]);

  return (
    <ThemedView style={styles.container}>
      <TopBar/>
      <ThemedText type="title" style={{color: '#000000'}}>Booking Confirmed!</ThemedText>
      <Image source={require('@/assets/images/camb_map.png')} style={styles.mapimg}/>
      {isConfirmed && info}

      {/* Confirm Booking Button */}
      <Pressable 
        style={[styles.button_confirm, isConfirmed && styles.button_pressed]} 
        onPress={handleConfirm}
        disabled={isConfirmed}
      >
        <Text style={styles.buttonText}>
          {isConfirmed ? 'Confirmed!' : 'Confirm Booking?'}
        </Text>
      </Pressable>

      {/* Cancel Booking Button */}
      <Pressable 
        style={styles.button_cancel}
        onPress={handleCancel}
      >
        <Text style={styles.buttonText}>
          {isConfirmed ? 'Cancel Booking' : 'Cancel'}
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