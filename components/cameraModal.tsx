import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Button, Text, Dialog } from "react-native-paper";

interface CameraModalProps {
  cameraVisible: boolean;
  hideCamera: () => void;
  setImage: (image: string) => void;
}

const CameraModal = ({ cameraVisible, hideCamera, setImage }: CameraModalProps) => {

  /**
   * openCamera
   * - Function to open the device's camera
   * - Uses ImagePicker to open the camera
   * - Sets the image state to the taken picture
   * - Hides the camera modal after taking a picture
   * 
   */
  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    // If the user cancels the camera, simply close the camera modal
    if (result.canceled) {
      hideCamera(); // Close the camera modal
      return;
    }

    // If the user successfully takes a picture, set the image and hide the camera modal
    if (result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri); // Set the image URI when the picture is taken
      hideCamera(); 
    }
  };

  return (
    <Dialog visible={cameraVisible}>
      <Dialog.Title>Capture</Dialog.Title>
      <Dialog.Content>
        <Text>You'll be redirected to your camera app to take a picture.</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={hideCamera}>Cancel</Button>
        <Button onPress={openCamera}>Open Camera</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default CameraModal;