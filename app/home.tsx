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
import AddReport from "../components/addReport";
import ViewReport from "../components/viewReport";

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
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const slideAnimation = useRef(new Animated.Value(300)).current;
  const [addReportVisible, setAddReportVisible] = useState(false);
  const [markers, setMarkers] = useState<MarkerType[]>([]); 
  const [reports, setReports] = useState<ReportType[]>([]);
  const [viewReportVisible, setViewReportVisible] = useState(false);

  const [user, setUser] = useState<User>({
    firstName: "",
    lastName: "",
    email: "",
    avatarUrl: "",
  });

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
        fetchMarkers(userLocation, 5);
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    const fetchUserData = async () => {
      if (auth().currentUser) {
        firestore().collection("users").doc(auth().currentUser?.uid).get()
        .then((doc) => {
          setUser({
            firstName: doc.data()?.firstName,
            lastName: doc.data()?.lastName,
            email: doc.data()?.email,
            avatarUrl: doc.data()?.avatarUrl,
          });
        })
        .catch((error) => {
          console.log(error);
        });
      }
    }

    initializeLocationAndFetchMarkers();
    fetchUserData();
  }, []);

  const getUserCurrentLocation = async (): Promise<Location.LocationObject> => {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  };

  const fetchMarkers = async (userLocation: Location.LocationObject, radius: number) => {
    try {
      const dateNow = new Date();
      const twentyFourHoursAgo = new Date(dateNow.getTime() - 24 * 60 * 60 * 1000);

      const snapshot = await firestore()
        .collection("markers")
        .where("lastCreatedReportAt", ">=", twentyFourHoursAgo)
        .get();

      const fetchedMarkers = snapshot.docs.map(doc => ({
        markerId: doc.id,
        latitude: doc.data().latitude,
        longitude: doc.data().longitude,
        lastCreatedReportAt: firestore.FieldValue.serverTimestamp(),
      }));

      const filteredMarkers = fetchedMarkers.filter((marker) => {
        const distance = memoizedHaversine(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          marker.latitude,
          marker.longitude
        );
        return distance <= radius;
      });

      setMarkers(filteredMarkers);
    } catch (error) {
      console.error("Error fetching markers:", error);
    } finally {
      setLoading(false);
    }
  };

  const memoizedHaversine = (() => {
    const cache = new Map();
    
    return (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const key = `${lat1},${lon1}-${lat2},${lon2}`;
      if (cache.has(key)) return cache.get(key);

      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      cache.set(key, distance);
      return distance;
    };
  })();

  const handleRefetchMarkers = async () => {
    try {
      setLoading(true);
      const userLocation = await getUserCurrentLocation();
      fetchMarkers(userLocation, 5);
    } catch (error) {
      console.error("Error refetching markers:", error);
    } finally {
      setLoading(false);
    }
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

  const fetchMarkerReports = async (markerId: string) => {
    try {
      const snapshot = await firestore().collection('reports').where('markerId', '==', markerId).get();
      const fetchedReports = snapshot.docs.map(doc => ({
        markerId: markerId,
        reportId: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        latitude: doc.data().latitude,
        longitude: doc.data().longitude,
        createdAt: doc.data().createdAt,
        userId: doc.data().userId,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
        imageUrl: doc.data().imageUrl,
      }));

      setReports(fetchedReports);
    } catch (error) {
      console.error("Error fetching reports: ", error);
    }
  }

  const handleAddReport = (e: any) => {
    const { coordinate } = e.nativeEvent;
    const selectedLocation = { ...coordinate, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    setSelectedLocation(selectedLocation);
    setAddReportVisible(true);
    Animated.timing(slideAnimation, { toValue: 0, duration: 150, useNativeDriver: true }).start();
  }

  const handleViewMarkerPress = async (markerId: string) => {
    await fetchMarkerReports(markerId);
    setViewReportVisible(true);
  }

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
                    handleAddReport(e);
                  }}
                >
                  {markers?.map((marker) => (
                    <Marker
                      key={marker.markerId}
                      coordinate={{
                        latitude: marker.latitude,
                        longitude: marker.longitude,
                      }}
                      onPress={() => handleViewMarkerPress(marker.markerId)}
                    />
                  ))}
                </MapView>

                {addReportVisible && selectedLocation && (
                  <AddReport
                    reportVisible={addReportVisible}
                    hideReport={() => { 
                      Animated.timing(slideAnimation, { toValue: 300, duration: 150, useNativeDriver: true })
                      .start(() => setAddReportVisible(false));
                    }}
                    slideAnimation={slideAnimation}
                    latitude={selectedLocation.latitude}
                    longitude={selectedLocation.longitude}
                    setMarkers={setMarkers}
                    isNewMarker={true}
                  />
                )}

                {viewReportVisible && (
                  <ViewReport
                    reportVisible={viewReportVisible}
                    hideViewReport={() => setViewReportVisible(false)}
                    reportsData={reports}
                    setMarkers={setMarkers}
                  />
                )}

                <FAB
                  icon="refresh"
                  onPress={handleRefetchMarkers}
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