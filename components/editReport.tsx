import React, { useEffect, useState } from "react";
import { View, ToastAndroid, TouchableOpacity, Image } from "react-native";
import { Modal, Portal, Text, Button, Divider, Appbar, IconButton, TextInput, useTheme } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

interface EditReportProps {
  editReportVisible: boolean;
  hideEditReport: () => void;
  hideViewReport: () => void;
  reportData: {
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
  } | null;
}

const EditReport = ({ editReportVisible, hideEditReport, hideViewReport, reportData }: EditReportProps) => {

  const [isEditing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(reportData?.title);
  const [newDescription, setNewDescription] = useState(reportData?.description);

  const [image, setImage] = useState<string | null>(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false); // New state for tracking image deletion
  const [isImageFullscreen, setImageFullscreen] = useState(false);
  const [isFilled, setIsFilled] = useState(true);
  
  const theme = useTheme();

  // Check if title is empty
  useEffect(() => {
    setIsFilled(newTitle === "");
  }, [newTitle]);

  // Set the image state if it exists
  useEffect(() => {
    if (reportData?.imageUrl) setImage(reportData.imageUrl);
  }, []);

  /**
   * handleEditReport
   * - Function to edit a report
   * - Updates the report in the reports collection
   * - Deletes the image from Firebase Storage if requested
   *
   */
  const handleEditReport = async () => {
    setEditing(true);

    if (newTitle === "") {
      ToastAndroid.show("Title is required", ToastAndroid.SHORT);
      setEditing(false);
      return;
    }

    setEditing(true)

    try {
      await firestore().collection("reports").doc(reportData?.reportId).update({
        title: newTitle,
        description: newDescription,
      });

      // Handle image deletion if requested
      if (isImageDeleted && reportData?.imageUrl) {
        await storage().ref(`reports/${reportData.reportId}/image.jpg`).delete();
        await firestore().collection("reports").doc(reportData?.reportId).update({
          imageUrl: null, // Update the Firestore record to remove the image URL
        });
      }

      setEditing(false);
      hideViewReport();
      hideEditReport();
      ToastAndroid.show("Report updated", ToastAndroid.SHORT);
    } catch (error) {
      console.log(error);
    } finally {
      setEditing(false)
    }
  }

  /**
   * handleDeleteImage
   * - Marks the image for deletion
   */
  const handleDeleteImage = () => {
    setIsImageDeleted(true); // Mark image for deletion
    setImage(null); // Remove image from UI
  };

  /**
   * handleCancelEdit
   * - Function to cancel the edit report process
   */
  const handleCancelEdit = () => {
    setIsImageDeleted(false); // Reset the deletion flag on cancel
    setImage(reportData?.imageUrl || null); // Restore the original image if it existed
    hideEditReport();
  };
  
  return (
    <Portal>
      <Modal
        visible={editReportVisible}
        onDismiss={handleCancelEdit}
        contentContainerStyle={{
          backgroundColor: theme.colors.background,
        }}
      >
        <View className="w-full h-full flex items-center justify-start px-2">
          <View className="mt-4 w-full flex flex-row items-center justify-between">
            <IconButton icon="close" onPress={handleCancelEdit} size={28} style={{ margin: 0 }} />
            <Text className="font-bold text-lg">Edit Report</Text>
            <IconButton icon="send" onPress={handleEditReport} size={28} style={{ margin: 0 }} disabled={isFilled || isEditing} iconColor={theme.colors.primary} />
          </View>

          <TextInput
            mode="outlined"
            outlineColor="hsla(0, 100%, 100%, 0)"
            activeOutlineColor="hsla(0, 100%, 100%, 0)"
            placeholder="Title"
            value={newTitle}
            onChangeText={(text) => setNewTitle(text)}
            className="w-[95%] mt-2 text-xl font-bold"
          />

          <Divider className="w-[95%]" style={{ backgroundColor: theme.colors.outline }}/>

          <TextInput
            mode="outlined"
            outlineColor="hsla(0, 100%, 100%, 0)"
            activeOutlineColor="hsla(0, 100%, 100%, 0)"
            placeholder="Description (optional)"
            value={newDescription}
            onChangeText={(text) => setNewDescription(text)}
            className="w-[95%] max-h-100 mt-4 py-5 text-base"
            multiline={true}
            numberOfLines={12}
          />

          {image && (
            <View className="w-[95%] mt-4">
              <TouchableOpacity onPress={() => setImageFullscreen(true)} className="w-[100px]">
                <Image source={{ uri: image }} style={{ width: 100, height: 100, borderRadius: 5 }} />
              </TouchableOpacity>
              <View className="w-[100px]">
                <Button mode="text" onPress={handleDeleteImage}>
                  Delete
                </Button>
              </View>
            </View>
          )}

          <Modal visible={isImageFullscreen} onDismiss={() => setImageFullscreen(false)}>
            <TouchableOpacity onPress={() => setImageFullscreen(false)}>
              {image && (
                <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
              )}
            </TouchableOpacity>
          </Modal>
        </View>
      </Modal>
    </Portal>
  )
}

export default EditReport;