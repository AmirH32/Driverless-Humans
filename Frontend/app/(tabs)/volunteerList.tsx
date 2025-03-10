import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, Pressable, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TopBar } from '@/components/TopBar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from "@/services/api";
import { useFontSize } from '@/contexts/FontSizeContext';

export default function VolunteerListScreen() {
  const router = useRouter();
  const [reservations, setReservations] = useState<JSX.Element[]>([]);
  const color = '#000000';

  // Font scaling
  const {fontScale, setFontScale} = useFontSize();
  const styles = createStyles(fontScale);

  // const latitude = 52.212;
  // const longitude = 0.0915;

  const noLocation = [
    <View style={styles.noLocation}>
      <Text>Please enable location permissions.</Text>
    </View>
  ]

  const volunteerFor = (reservation_id) => {
    router.push(`/confirmed_v?ReservationID=${reservation_id}`);
  };

  const getReservations = async (latitude, longitude) => {
    if (latitude === null || longitude === null) {
      setReservations(noLocation);
      return;
    }
    try {
      const response = await api.get("/show_reservations", {params: {latitude, longitude, limit: 5}});
      const data = response.data;
      // const data = {"message":"Reservations retrieved successfully.","reservations":[{"arrival_min":338,"destination_id":"0500CCITY523","distance":0.0004016471372001294,"origin_id":"0500CCITY423","ramp_type":"MANUAL","reservation_id":11,"route_id":"U1","route_name":"U1","seats_empty":1,"vehicle_id":"v0","volunteer_count":0},{"arrival_min":385,"destination_id":"0500CCITY423","distance":0.5085989229610376,"origin_id":"0500CCITY523","ramp_type":"MANUAL","reservation_id":12,"route_id":"U1","route_name":"U1","seats_empty":1,"vehicle_id":"v1","volunteer_count":1}]}

      const getRampType = (dat) => {
        return dat["ramp_type"] === "MANUAL" ? "manual" : "automatic";
      };
      
      const resComponents = data.reservations.map((res, index) => (
        <Pressable
          key={index}
          style={styles.busview_container}
          onPress={() => volunteerFor(res.reservation_id)}
        >
          <Text style={styles.busview_busNumber}>{res["route_name"]}</Text>
          <View style={styles.busview_infoContainer}>
            <IconSymbol size={50} name="distance" color={color} />
            <Text>{res["distance"].toFixed(1)} km</Text>
          </View>
          <View style={styles.busview_infoContainer}>
            <IconSymbol size={50} name="clock" color={color} />
            <Text>{res["arrival_min"]} min</Text>
          </View>
          <View style={styles.busview_infoContainer}>
            <IconSymbol size={50} name="wheelchair" color={color} />
            <Text>{res["seats_empty"]} seat(s) free</Text>
          </View>
          <View style={styles.busview_infoContainer}>
            <IconSymbol size={50} name={getRampType(dat)} color={color} />
            <Text>{getRampType(res)}</Text>
          </View>
          <View style={styles.busview_infoContainer}>
            <IconSymbol size={50} name="volunteer" color={color} />
            <Text>{res["volunteer_count"]}</Text>
          </View>
        </Pressable>
      ));

      setReservations(resComponents);  // Update state with bus components
    } catch (error) {
      console.error("Error during stops fetch, could not connect to server:", error);
    }
  };

  useEffect(() => {
    setReservations(noLocation);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getReservations(position.coords.latitude, position.coords.longitude)
      },
      (error) => console.error("Error getting location:", error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
    );
  }, []);

  return (
    <ThemedView style={styles.wide_container}>
      <TopBar />
      <ThemedView style={styles.container}>
        {reservations.length > 0 ? reservations : <Text>No reservations</Text>}
      </ThemedView>
    </ThemedView>
  );
}



const createStyles = (fontScale:number) => {
  return (
      StyleSheet.create({
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
        fontSize: 25 * fontScale,
        lineHeight: 25 * fontScale * 1.2,

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
      noLocation: {
        height: 160,
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#39b7ff',
        borderRadius: 30,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'space-evenly'
      },
    })
  )
};
