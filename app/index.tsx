import { Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import bikeLogo from "../assets/images/bike-logo.png";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useState, useEffect } from "react";

export default function App() {

  useEffect(() => {

    // request permission to access user location
    const requestPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      } 
    }

    requestPermissions();
  }, []);

  return (
    <SafeAreaView className="h-full w-full">
      <View className='w-full h-[90vh] flex items-center justify-center'>
        <Image source={bikeLogo} className="w-40 h-40" resizeMode="contain" />
        <Text className='text-xl font-bold w-40 text-center'>Loading...</Text>
      </View>
    </SafeAreaView>
  );
}