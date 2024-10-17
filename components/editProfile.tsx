import { Portal, Modal, TextInput, Button, IconButton, Appbar, Divider, Text, Avatar, useTheme } from "react-native-paper";
import { Animated, View, Alert, ToastAndroid, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

interface EditProfileProps {
  editProfileVisible: boolean;
  hideEditProfile: () => void;
  user : {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
  };
}

const EditProfile = ({ editProfileVisible, hideEditProfile, user }: EditProfileProps) => {

  const [isEditing, setEditing] = useState(false);
  const [newFirstName, setNewFirstName] = useState(user.firstName);
  const [newLastName, setNewLastName] = useState(user.lastName);
  const [newAvatarUrl, setNewAvatarUrl] = useState(user.avatarUrl);
  const theme = useTheme();

  /**
   * handleChangeAvatar
   * - Function to change the user's avatar
   * - Uses ImagePicker to select an image from the device's gallery
   * - Sets the newAvatarUrl state to the selected image
   * 
   */
  const handleChangeAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewAvatarUrl(result.assets[0].uri);
    }
  }

  /**
   * uploadAvatar
   * - Function to upload the user's new avatar to Firebase Storage
   * - Uploads the avatar to the avatars collection in Firebase Storage
   * - Returns the download URL of the uploaded avatar
   * 
   * @param userId - the user's ID
   * @returns the download URL of the uploaded avatar
   */
  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!newAvatarUrl) return null;

    try {
      const avatarRef = storage().ref(`avatars/${userId}/avatar.jpg`);
      await avatarRef.putFile(newAvatarUrl);

      const downloadURL = await avatarRef.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error("Error uploading avatar: ", error);
      return null;
    }
  }

  /**
   * handleEditProfile
   * - Function to edit the user's profile
   * - Updates the user's first name, last name, and avatar URL
   * - Uploads the new avatar if it has changed
   * 
   */
  const handleEditProfile = async () => {
    setEditing(true);

    if (newFirstName === "" || newLastName === "") {
      ToastAndroid.show("First Name and Last Name are required", ToastAndroid.SHORT);
      setEditing(false);
      return;
    }

    const userId = auth().currentUser?.uid;

    if (!userId) {
      ToastAndroid.show("User ID is undefined", ToastAndroid.SHORT);
      setEditing(false);
      return;
    }

    try {
      let avatarUrl = newAvatarUrl;

      // Check if avatar has changed, if so, upload the new one
      if (newAvatarUrl !== user.avatarUrl) {
        const uploadedAvatarUrl = await uploadAvatar(userId);
        avatarUrl = uploadedAvatarUrl ?? newAvatarUrl; // Ensure avatarUrl is always a string
      }

      await firestore().collection("users").doc(userId).update({
        firstName: newFirstName,
        lastName: newLastName,
        avatarUrl: avatarUrl, // Now guaranteed to be a string
      });

      setEditing(false);
      hideEditProfile();
      ToastAndroid.show("Profile updated successfully", ToastAndroid.SHORT);
    } catch (error) {
      console.log(error);
      ToastAndroid.show("Error updating profile", ToastAndroid.LONG);
      setEditing(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={editProfileVisible}
        onDismiss={hideEditProfile}
        contentContainerStyle={{
          backgroundColor: theme.colors.background,
          padding: 20,
          margin: 20,
          borderRadius: 10,
        }}
      >
        {/* only avatar, first name, and last name are editable */}
        <View className="w-full flex items-center justify-center mt-2">
          <Avatar.Image size={150} source={{ uri: newAvatarUrl }} />
          <Button mode="text" icon="camera" className="my-4 rounded-md" onPress={handleChangeAvatar}>
            Change Avatar
          </Button>
        </View>

        <View className="flex flex-col items-center justify-evenly">
          <TextInput
            mode="outlined"
            label="First Name"
            className="w-full"
            value={newFirstName}
            onChangeText={setNewFirstName}
          />

          <TextInput
            mode="outlined"
            label="Last Name"
            className="w-full mt-4 mb-4"
            value={newLastName}
            onChangeText={setNewLastName}
          />
        </View>

        <View className="flex flex-row items-center justify-evenly">
          {/* cancel and edit buttons */}
          <Button mode="text" onPress={hideEditProfile} className="rounded-md w-1/2">
            Cancel
          </Button>

          <Button mode="text" onPress={handleEditProfile} disabled={isEditing} className="rounded-md w-1/2 ">
            {isEditing ? "Saving..." : "Save"}
          </Button>
        </View>
      </Modal>
    </Portal>
  )
}

export default EditProfile;