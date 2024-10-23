import { Portal, Modal, Text, Button, TextInput, IconButton, ActivityIndicator, Appbar, Divider, useTheme } from "react-native-paper";
import { Animated, View, Alert, ToastAndroid, Image, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from "expo-image-picker";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import CameraModal from "./cameraModal";

interface AddReportProps {
  reportVisible: boolean;
  hideReport: () => void;
  hideViewReport?: () => void; // optional for hiding view report
  slideAnimation: any;
  markerId?: string; // optional for new markers
  latitude: number;
  longitude: number;
  setMarkers?: (markers: (prevMarkers: any[]) => any[]) => void; // optional for creating new markers
  isNewMarker?: boolean; // flag to differentiate between new report or adding to an existing one
}

const AddReport = ({ reportVisible, hideReport, hideViewReport, slideAnimation, markerId, latitude, longitude, setMarkers, isNewMarker }: AddReportProps) => {
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [isFilled, setIsFilled] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  
  const [image, setImage] = useState<string | null>(null);
  const [isImageFullscreen, setImageFullscreen] = useState(false);
  
  const [cameraVisible, setCameraVisible] = useState(false);
  
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();

  // Check if title is empty
  useEffect(() => {
    setIsFilled(title === "");
  }, [title]);

  /**
   * pickImage
   * - Function to pick an image from the device's gallery
   * - Uses ImagePicker to select an image
   * - Sets the image state to the selected image
   * - Different from CameraModal which uses the device's camera
   * 
   */
  const pickImage = async () => {
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!pickerResult.canceled) {
        setImage(pickerResult.assets[0].uri);
      }
    } catch (error) {
      console.error("Error selecting image: ", error);
      ToastAndroid.show("Error selecting image", ToastAndroid.SHORT);
    }
  };

  /**
   * uploadImage
   * - Function to upload the image to Firebase Storage
   * - Uploads the image to the reports folder with the reportId as the filename
   * - Returns the download URL of the uploaded image
   * 
   * @param reportId - the reportId to use as the filename within Firebase Storage
   * @returns string | null
   */
  const uploadImage = async (reportId: string): Promise<string | null> => {
    if (!image) return null;

    try {
      const imageRef = storage().ref(`reports/${reportId}/image.jpg`);
      await imageRef.putFile(image);
      return await imageRef.getDownloadURL();
    } catch (error) {
      console.error("Error uploading image: ", error);
      return null;
    }
  };

  /**
   * handleSubmit
   * - Function to handle the submission of the report
   * - Creates a new report document
   * - If it's a new marker, creates a new marker document
   * - If it's an existing marker, updates the lastCreatedReportAt field of the marker
   * - Uploads the image to Firebase Storage (if image is selected)
   * - Adds the report to the user's reports array 
   * 
   * @returns 
   */
  const handleSubmit = async () => {
    setSubmitting(true);

    if (!title.trim()) {
      Alert.alert("Please enter a condition title");
      return;
    }

    try {
      const user = auth().currentUser;

      if (!user) {
        Alert.alert("Error", "User is not authenticated");
        setSubmitting(false);
        return;
      }

      const userProfileDoc = await firestore().collection("users").doc(user.uid).get();
      const userProfile = userProfileDoc.data();

      if (!userProfile) {
        Alert.alert("Error", "User profile not found");
        setSubmitting(false);
        return;
      }

      const { firstName, lastName } = userProfile;
      const reportRef = firestore().collection("reports").doc();
      const imageUrl = await uploadImage(reportRef.id);

      if (isNewMarker) { // If it's a new marker, create the marker first
        const markerRef = firestore().collection("markers").doc();

        await markerRef.set({
          markerId: markerRef.id,
          latitude,
          longitude,
          lastCreatedReportAt: firestore.FieldValue.serverTimestamp(),
        });

        await reportRef.set({
          markerId: markerRef.id,
          reportId: reportRef.id,
          title: title.trim(),
          description: description.trim(),
          latitude,
          longitude,
          createdAt: firestore.FieldValue.serverTimestamp(),
          userId: user.uid,
          firstName,
          lastName,
          imageUrl,
        });

        // Update markers state if new marker
        setMarkers?.((prevMarkers) => [
          ...prevMarkers,
          { markerId: markerRef.id, latitude, longitude },
        ]);

      } else { // If adding a report to an existing marker
        await firestore().collection("markers").doc(markerId).update({
          lastCreatedReportAt: firestore.FieldValue.serverTimestamp(),
        });

        await reportRef.set({
          markerId,
          reportId: reportRef.id,
          title: title.trim(),
          description: description.trim(),
          latitude,
          longitude,
          createdAt: firestore.FieldValue.serverTimestamp(),
          userId: user.uid,
          firstName,
          lastName,
          imageUrl,
        });
      }

      await firestore().collection("users").doc(user.uid).update({
        reports: firestore.FieldValue.arrayUnion(reportRef.id),
      });

      ToastAndroid.show("Condition reported!", ToastAndroid.LONG);
      hideReport();
      hideViewReport?.();
      resetForm();

    } catch (error) {
      console.error("Error reporting condition: ", error);
      ToastAndroid.show("Error reporting condition", ToastAndroid.LONG);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * resetForm
   * - Function to reset the form fields
   * - Resets the title, description, and image states
   * 
   */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImage(null);
  };

  return (
    <Portal>
      <Modal
        visible={reportVisible}
        onDismiss={hideReport}
        contentContainerStyle={{
          backgroundColor: theme.colors.background,
        }}
      >
        <Animated.View style={{ transform: [{ translateY: slideAnimation }] }} className="w-full h-full flex items-center justify-start px-2">
          <View className="mt-4 w-full flex flex-row items-center justify-between">
            <IconButton icon="close" onPress={hideReport} size={28} style={{ margin: 0 }} />
            <Text className="font-bold text-lg">Create Report</Text>

            { isSubmitting ? (
              <ActivityIndicator animating={true} color={theme.colors.primary} size={28} className="pr-4" />
            ) : (
              <IconButton icon="send" onPress={handleSubmit} size={28} style={{ margin: 0 }} disabled={isFilled || isSubmitting} iconColor={theme.colors.primary} />
            )}

          </View>

          <TextInput
            mode="outlined"
            outlineStyle={{ borderColor: "hsla(0, 100%, 100%, 0)"}}
            placeholder="Title"
            value={title}
            onChangeText={(text) => setTitle(text)}
            className="w-[95%] mt-2 text-xl font-bold"

          />

          <Divider className="w-[95%]" style={{ backgroundColor: theme.colors.outline }}/>

          <TextInput
            mode="outlined"
            outlineStyle={{ borderColor: "hsla(0, 100%, 100%, 0)"}}
            placeholder="Description (optional)"
            value={description}
            onChangeText={(text) => setDescription(text)}
            className="w-[95%] max-h-100 mt-4 py-5 text-lg"
            multiline={true}
            numberOfLines={12}
          />

          {image && (
            <View className="w-[95%] mt-4">
              <TouchableOpacity onPress={() => setImageFullscreen(true)} className="w-[100px]">
                <Image source={{ uri: image }} style={{ width: 100, height: 100, borderRadius: 5 }} />
              </TouchableOpacity>
              <View className="w-[100px]">
                <Button mode="text" onPress={() => setImage(null)}>
                  Remove
                </Button>
              </View>
            </View>
          )}

          <Appbar safeAreaInsets={{ bottom }} className="w-full absolute bottom-0" style={{ backgroundColor: theme.colors.background }}>
            <Appbar.Action icon="image" size={28} onPress={pickImage} />
            <Appbar.Action icon="camera" size={28} onPress={() => setCameraVisible(true)} />
          </Appbar>
        </Animated.View>
      </Modal>

      <CameraModal cameraVisible={cameraVisible} hideCamera={() => setCameraVisible(false)} setImage={setImage} />

      <Modal visible={isImageFullscreen} onDismiss={() => setImageFullscreen(false)}>
        <TouchableOpacity onPress={() => setImageFullscreen(false)}>
          {image && (
            <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          )}
        </TouchableOpacity>
      </Modal>
    </Portal>
  );
};

export default AddReport;