import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, Pressable, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TopBar } from '@/components/TopBar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from "@/services/api";
import { useFontSize } from '@/contexts/FontSizeContext';

export default function LoginScreen() {
  const router = useRouter();
  const [busstop, setBusStop] = useState('');
  const [busses, setBusses] = useState<JSX.Element[]>([]);  // State for storing bus data
  const color = '#000000';

  // Font scaling
  const {fontScale, setFontScale} = useFontSize();
  const styles = createStyles(fontScale);

  const backToEdit = () => {
    alert("This button should link back to the origin/ desitination page");
    router.back();
  };

  const formatDateForSQL = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');  // Months are 0-based
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
  
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };
  
  
  
  const bookBus = async (src_stop_id, dst_stop_id, vehicle_id) => {
    console.log("bookBus"); console.log(src_stop_id); console.log(dst_stop_id); console.log(vehicle_id);
    const date = new Date();
    const formattedDate = formatDateForSQL(date);
    const response = await api.post("/create_reservation", {
      StopID1: src_stop_id,
      StopID2: dst_stop_id,
      BusID: vehicle_id,
      Time: formattedDate,
      VolunteerCount: 0
    });
    router.push("/confirmed");
  };

  const { src_stop_id, dst_stop_id, src_stop_name, dst_stop_name } = useLocalSearchParams();
  // const src_stop_id = "0500CCITY423";
  // const dst_stop_id = "0500CCITY523"; // TODO these should be passed from the prev page
  // const src_stop_name = "name 1";
  // const dst_stop_name = "name 2"; // TODO These also need to be passed, used for the top display

  const getTimetables = async () => {
    try {
      // const dummy_data = [{
      //   "arrival_min": 12,
      //   "ramp_type": "MANUAL",
      //   "route_id": "U1",
      //   "route_name": "U1",
      //   "seats_empty": 1,
      //   "vehicle_id": "v0"
      // }, {
      //   "arrival_min": 22,
      //   "ramp_type": "MANUAL",
      //   "route_id": "U2",
      //   "route_name": "U2",
      //   "seats_empty": 2,
      //   "vehicle_id": "v1"
      // }];

      const response = await api.get("/timetables", {params: {origin_id: src_stop_id, destination_id: dst_stop_id}});
      const data = response.data;

      // Font scaling
      const {fontScale, setFontScale} = useFontSize();
      const styles = createStyles(fontScale);

      const getRampType = (dat) => {
        return dat["ramp_type"] === "MANUAL" ? "Manual ramp" : "Automatic ramp";
      };
      
      const bussesComponents = data.map((dat, index) => (
        <Pressable
          key={index}
          style={styles.busview_container}
          onPress={() => bookBus(src_stop_id, dst_stop_id, dat["vehicle_id"])}
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
            <IconSymbol size={50} name="{getRampType(dat)}" color={color} />
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
        fontSize: 50 * fontScale,
        lineHeight: 50 * fontScale * 1.2,
      },
      busview_infoContainer: {
        alignItems: 'center',
      },
    })
  )
};