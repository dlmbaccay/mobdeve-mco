import { View, ToastAndroid, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAB, useTheme } from 'react-native-paper';
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import SpinningWheel from "../components/spinningWheel";

interface LocationType {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

interface ReportType {
  markerId: string;
  reportId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  createdAt: any;
  userId: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
}

interface MarkerType {
  markerId: string;
  latitude: number;
  longitude: number;
  lastCreatedReportAt: any;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

const Home = () => {

  const [location, setLocation] = useState<LocationType | null>(null);
  const theme = useTheme();
  const [isLoading, setLoading] = useState(true);
  const [mapRef, setMapRef] = useState<MapView | null>(null);
  const [isNotCentered, setIsNotCentered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const initializeLocationAndFetchMarkers = async () => {
      try {
        const userLocation = await getUserCurrentLocation();
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        
      } catch (error) {
        console.error("Error fetching location:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeLocationAndFetchMarkers();
  }, []);

  const getUserCurrentLocation = async (): Promise<Location.LocationObject> => {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  };

  const handleRegionChange = (region: any) => {
    if (location) {
      const isCentered =
        Math.abs(region.latitude - location.latitude) < 0.0001 &&
        Math.abs(region.longitude - location.longitude) < 0.0001;

      setIsNotCentered(!isCentered);
    }
  };

  const recenterMap = async () => {
    if (mapRef && location && !isAnimating) {
      setIsAnimating(true);
      mapRef.animateToRegion(
        {
          ...location,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000  // 1-second animation
      );

      setTimeout(() => {
        setIsNotCentered(false);
        setIsAnimating(false);  // Reset after animation
      }, 1000);
    }
  };

  return (
    <SafeAreaView className="h-full w-full" style={{ backgroundColor: theme.colors.background }}>
      <View className="w-full h-full flex items-center justify-center">
        {isLoading ? (  
          <SpinningWheel />
        ) : (
          <>
            { location && ( 
              <>
                <MapView
                  ref={(map) => setMapRef(map)}
                  className="w-full h-full"
                  initialRegion={location} 
                  showsMyLocationButton={false}
                  onRegionChangeComplete={(region) => handleRegionChange(region)}
                  showsUserLocation={true}
                  provider="google"
                  onLongPress={(e) => {
                    // TODO: add marker/reports functionality
                  }}
                >
                </MapView>

                <FAB
                  icon="refresh"
                  onPress={() => {
                    // TODO: refetch markers once implemented
                  }}
                  style={{ position: 'absolute', margin: 16, right: 5, bottom: 75, backgroundColor: theme.colors.primaryContainer }}
                />

                <FAB
                  icon={`${isNotCentered ? 'navigation-variant-outline' : 'navigation-variant'}`}
                  onPress={recenterMap}
                  style={{ position: 'absolute', margin: 16, right: 5, bottom: 5, backgroundColor: theme.colors.primaryContainer }}
                />
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Home;