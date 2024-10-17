import React from 'react';
import { router } from "expo-router";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Modal, Button, IconButton, Avatar, Text, useTheme } from "react-native-paper";
import { View, Image, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EditProfile from '../../components/editProfile';


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
  

  return (
    <SafeAreaView className='h-full w-full flex items-center justify-start' style={{ backgroundColor: theme.colors.background }}>
      <View className='w-full'>
        <IconButton icon="arrow-left" size={25} onPress={() => router.push("home")} />
      </View>

      <View className='h-[80%] w-full flex items-center justify-center'>
        { user.avatarUrl ? (
          <TouchableOpacity onPress={() => setImageFullscreen(true)} className='mb-8'>
            <Avatar.Image size={150} source={{ uri: user.avatarUrl }} />
          </TouchableOpacity>
        ) : null }

        <View className='flex flex-row items-center justify-center w-full mb-8'>
          <Text className='text-2xl font-bold'>{user.firstName} {user.lastName}</Text>
        </View>

        <View className='flex flex-row items-center justify-center mb-8'>
          <Text className='text-base'>{user.email}</Text>
        </View>
      
        <Button mode="contained" className="rounded-md" onPress={() => setEditModalVisible(true)} style={{ backgroundColor: theme.colors.primaryContainer }}>
          <Text className='font-bold'>Edit Profile</Text>
        </Button>
      </View>

      { editModalVisible ? (
        <EditProfile
          editProfileVisible={editModalVisible}
          hideEditProfile={() => setEditModalVisible(false)}
          user={user}
        />
      ) : null }

      <Modal visible={isImageFullscreen} onDismiss={() => setImageFullscreen(false)}>
        <TouchableOpacity onPress={() => setImageFullscreen(false)}>
          { user?.avatarUrl && (
            <Image source={{ uri: user?.avatarUrl }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export default UserProfile;