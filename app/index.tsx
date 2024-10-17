import { View, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from "react";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import SpinningWheel from "../components/spinningWheel";

export default function App() {
  const theme = useTheme();
  
  useEffect(() => {

    /**
     * redirectUser
     * - Function to redirect user to home or sign-in screen
     * - Redirects user to home screen if user is signed in
     * - Redirects user to sign-in screen if user is not signed in
     * 
     */
    const redirectUser = () => { // redirect user to home or sign-in screen
      setTimeout(() => {
        auth().onAuthStateChanged((user) => {
          if (user) {
            router.push("home");
          } else {
            router.push("sign-in");
          }
        });
      }, 2000);
    }

    /**
     * getPermissions
     * - Function to get location and photos permissions
     * - Requests location and photos permissions
     * - Calls redirectUser function if permissions are granted
     * 
     */
    const getPermissions = async () => { // get location and photos permissions
      const { status: cameraStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

      if (cameraStatus !== "granted" || locationStatus !== "granted") {
        Alert.alert("Permissions Error", "You need to grant location and photos permissions to use this app");
        return;
      } else {
        redirectUser();
      }
    }

    getPermissions();
  }, []);

  return (
    <SafeAreaView className="h-full w-full" style={{ backgroundColor: theme.colors.background }}>
      <View className="h-full w-full flex items-center justify-center">
        <SpinningWheel />
      </View>
    </SafeAreaView>
  );
}