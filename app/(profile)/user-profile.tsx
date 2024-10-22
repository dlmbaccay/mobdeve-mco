import React from 'react';
import { router } from "expo-router";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Modal, Button, IconButton, Avatar, Text, useTheme } from "react-native-paper";
import { View, Image, TouchableOpacity, useColorScheme } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EditProfile from '../../components/editProfile';
import bikeLogoLight from "../../assets/images/bike-logo-light.png";
import bikeLogoDark from "../../assets/images/bike-logo-dark.png";
import SpinningWheel from '../../components/spinningWheel';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

const UserProfile = () => {

  const [user, setUser] = useState<User>({
    firstName: "",
    lastName: "",
    email: "",
    avatarUrl: "",
  });

  const [isImageFullscreen, setImageFullscreen] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // retrieve auth user data
  useEffect(() => {
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
  }, [user]);

  const theme = useTheme();
  const colorScheme = useColorScheme();
  const bikeLogo = colorScheme === "light" ? bikeLogoLight : bikeLogoDark;

  return (
    <SafeAreaView className='h-full w-full' style={{ backgroundColor: theme.colors.background }}>
      <View className='w-full h-full flex items-center justify-center'>
        { user.avatarUrl ? (
          <>
            <View className='h-[80%] w-full flex items-center justify-center'>
              <TouchableOpacity onPress={() => setImageFullscreen(true)} className='mb-8'>
                <Avatar.Image size={150} source={{ uri: user.avatarUrl }} />
              </TouchableOpacity>
              

              <View className='flex flex-row items-center justify-center w-full mb-2'>
                <Text className='text-2xl font-bold'>{user.firstName} {user.lastName}</Text>
              </View>
          
              <View className='flex flex-row items-center justify-center mb-8'>
                <Text className='text-base'>{user.email}</Text>
              </View>
      
             <View className='flex flex-row items-center justify-center'>
              <Button mode="contained" className="rounded-md w-[120px] mr-4" onPress={(() => router.push("home"))} style={{ backgroundColor: theme.colors.primary }}>
                <Text className='font-bold' style={{ color: theme.colors.onPrimary }}>Go Home</Text>
              </Button>

              <Button mode="contained" className="rounded-md w-[120px]" onPress={() => setEditModalVisible(true)} style={{ backgroundColor: theme.colors.primary }}>
                <Text className='font-bold' style={{ color: theme.colors.onPrimary }}>Edit Profile</Text>
              </Button>
             </View>
            </View>

            { editModalVisible ? (
              <EditProfile
                editProfileVisible={editModalVisible}
                hideEditProfile={() => setEditModalVisible(false)}
                user={user}
              />
            ) : null }

            <View className="w-full flex flex-row items-center justify-center">
              <Image source={bikeLogo} className="w-[45px] h-[45px]" resizeMode="contain" />

              <Text className="text-[35px] mt-2 pl-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                BikeSafe
              </Text>
            </View>

            <Modal visible={isImageFullscreen} onDismiss={() => setImageFullscreen(false)}>
              <TouchableOpacity onPress={() => setImageFullscreen(false)}>
                { user?.avatarUrl && (
                  <Image source={{ uri: user?.avatarUrl }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                )}
              </TouchableOpacity>
            </Modal>
          </>
        ) : <SpinningWheel /> }
      </View>
    </SafeAreaView>
  );
}

export default UserProfile;