import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Pressable, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TopBar } from '@/components/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleVolounteer = async () => {
    // TODO: Send a volounteer request
    // TODO: Remove the button
    alert("This button should send an api request to volounteer, then the button should disappear");
  };
  const handleCancel = async () => {
    // TODO: Send a cancel request
    // TODO: Redirect to the search page porbably (possibly the timetables page??)
    alert("This button should send an api request to volounteer, then the button should disappear");
  };



  return (
    <ThemedView style={styles.container}>
      <TopBar/>
      <ThemedText type="title" style={{color: '#000000'}}>Booking Confirmed!</ThemedText>
      <Image source={require('@/assets/images/camb_map.png')} style={styles.mapimg}/>
      <View style={styles.infoView}>
        <ThemedView style={styles.infoEntry}>
          <IconSymbol size={50} name="house.fill" color={'#000000'} /> 
          <ThemedText style={styles.infoText}>1 Seat Available</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoEntry}>
          <IconSymbol size={50} name="house.fill" color={'#000000'} /> 
          <ThemedText style={styles.infoText}>4 Volunteers Available</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoEntry}>
          <IconSymbol size={50} name="clock" color={'#000000'} /> 
          <ThemedText style={styles.infoText}>30 Minute wait</ThemedText>
        </ThemedView>
      </View>
      <Pressable style={styles.button_volouteer} onPress={handleVolounteer}>Volunteer</Pressable> 
      <Pressable style={styles.button_cancel} onPress={handleCancel}>Cancel</Pressable> 
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wide_container: {
    height: '100vh',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflowY: 'scroll',
    backgroundColor: '#FFFFFF',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  button_volouteer: { // todo how does css merge in this stuff
    backgroundColor: '#03bf62',
    color: '#FFFFFF',
    fontFamily: 'Arial',
    textAlign: 'center',
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
    fontSize: 30,
    borderRadius: 20,
    width: '90vw',

  },
  button_cancel: {
    backgroundColor: '#ff3130',
    color: '#FFFFFF',
    fontFamily: 'Arial',
    textAlign: 'center',
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
    fontSize: 30,
    borderRadius: 20,
    width: '90vw',
    marginBottom: 30,

  },
  infoView: {
    backgroundColor: '#39b7ff',
    color: '#FFFFFF',
    fontFamily: 'Arial',
    textAlign: 'center',
    height: 200,
    justifyContent: 'center',
    marginTop: 20,
    fontSize: 30,
    borderRadius: 25,

  },
  infoEntry: {
    flex: 1,
    flexDirection: 'row',
    color: '#000000',
    alignItems: 'center',
    margin: 3,
    backgroundColor: 'rgba(52, 52, 52, 0)', // Bit of a work aroud but oh well
  },
  infoText: {
    color: '#000000',
  },
  mapimg: {
    width: 200,
    height: 200,
    marginTop: 10,
  }
}); 