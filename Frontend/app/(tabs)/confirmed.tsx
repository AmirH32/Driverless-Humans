import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TopBar } from '@/components/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFontSize } from '@/contexts/FontSizeContext';
import api from '@/services/api';
import { speakText } from '@/services/ttsUtils';
import axios, { AxiosError } from 'axios';

export default function ConfirmedScreen() {
  const router = useRouter();

  // Font scaling
  const {fontScale, setFontScale} = useFontSize();
  const styles = createStyles(fontScale);
  
  // Track if the booking has been confirmed
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [info, setInfo] = useState<JSX.Element | null>(null);
  const { StopID1, StopID2, BusID, Time, VolunteerCount } = useLocalSearchParams();
  
  // Handle confirming the booking
  const handleConfirm = async () => {
    try{
      console.log("Confirm fetching data.")
      const response = await api.post("/create_reservation", {StopID1, StopID2, BusID, Time, VolunteerCount: parseInt(VolunteerCount as string, 10)});
      await new Promise(resolve => setTimeout(resolve, 100));
      if (response.data.success) {
        setIsConfirmed(true);
        fetchData();
      } else {
        // You can handle non-200 responses here if needed
        alert("Reservation confirmation failed: " + response.data.message);
      }
    } catch (error: unknown) {
      // Handle Axios error
      if (axios.isAxiosError(error)) {
        // Check if error.response exists and contains a message
        if (error.response && error.response.data && error.response.data.message) {
          alert("Reservation confirmation failed: " + error.response.data.message);
        } else {
          // Handle error without message (e.g., network issues)
          alert("Reservation confirmation failed: Unknown error from the server.");
        }
      } else if (error instanceof Error) {
        // Generic JS error
        alert("Error during reservation confirmation: " + error.message);
      } else {
        // Fallback for unknown errors
        alert("An unknown error occurred.");
      }
    }
  };
  
  // Handle cancelling the booking
  const handleCancel = async () => {
    if (isConfirmed) {
      // Unpress the button
      setIsConfirmed(false);

      // TODO: API request to cancel the booking
      try{
        const response = api.post("/delete_reservation");
      } catch (error: unknown) {
        // Handle Axios error
        if (axios.isAxiosError(error)) {
          // Check if error.response exists and contains a message
          if (error.response && error.response.data && error.response.data.message) {
            alert("Reservation deletion failed: " + error.response.data.message);
          } else {
            // Handle error without message (e.g., network issues)
            alert("Reservation deletion failed: Unknown error from the server.");
          }
        } else if (error instanceof Error) {
          // Generic JS error
          alert("Error during reservation deletion: " + error.message);
        } else {
          // Fallback for unknown errors
          alert("An unknown error occurred.");
        }
      }
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
        onPress={() => {speakText('Confirm button clicked'); handleConfirm();}}
        disabled={isConfirmed}
      >
        <Text style={styles.buttonText}>
          {isConfirmed ? 'Confirmed!' : 'Confirm Booking?'}
        </Text>
      </Pressable>

      {/* Cancel Booking Button */}
      <Pressable 
        style={styles.button_cancel}
        onPress={() => {speakText('Cancel button clicked'); handleCancel();}}
      >
        <Text style={styles.buttonText}>
          {isConfirmed ? 'Cancel Booking' : 'Cancel'}
        </Text>
      </Pressable>

    </ThemedView>
  );
}

const createStyles = (fontScale: number) => {
  return (
    StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
      },
      title: {
        fontSize: 30 * fontScale,
        lineHeight: 30 * fontScale * 1.2,
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
        fontSize: 18 * fontScale,
        lineHeight: 18 * fontScale * 1.2,
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
        fontSize: 20 * fontScale,
        lineHeight: 20 * fontScale * 1.2,
        fontWeight: 'bold',
      },
    })
  )
};
