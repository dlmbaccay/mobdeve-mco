import React, { useState } from "react";
import { ToastAndroid } from "react-native";
import { Text, Portal, Button, Dialog } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import { ReportType } from "../types/interfaces";

interface DeleteReportProps {
  deleteReportVisible: boolean;
  hideDeleteReport: () => void;
  hideViewReport: () => void;
  reportData : ReportType | null;
  setMarkers: (markers: (prevMarkers: any[]) => any[]) => void;
}

const DeleteReport = ({ deleteReportVisible, hideDeleteReport, hideViewReport, reportData, setMarkers }: DeleteReportProps) => {

  const [isDeleting, setDeleting] = useState(false);

  /**
   * handleDeleteReport
   * - Function to delete a report
   * - Deletes the report from the reports collection
   * - Deletes the report from the user's reports collection
   * - Deletes the associated image from Firebase Storage
   * - Deletes the marker if it's the only report linked to it
   * 
   */
  const handleDeleteReport = async () => {
    try {
      setDeleting(true);

      // Fetch all reports linked to the same markerId
      const reportsInMarker = await firestore()
        .collection("reports")
        .where("markerId", "==", reportData?.markerId)
        .get();

      // Check if only one report is linked to the marker
      if (reportsInMarker.docs.length === 1) {
        // Delete the marker if it's the only report linked to it
        await firestore().collection("markers").doc(reportData?.markerId).delete();

        // Update the markers state
        setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.markerId !== reportData?.markerId));
      }

      // Delete the report
      await firestore().collection("reports").doc(reportData?.reportId).delete();
      
      // Delete the report from the user's reports
      await firestore().collection("users").doc(reportData?.userId).collection("reports").doc(reportData?.reportId).delete();

      // Delete the associated image, if it exists
      if (reportData?.imageUrl) {
        await storage().ref(`reports/${reportData?.reportId}/image.jpg`).delete();
      }

      setDeleting(false);
      hideViewReport();
      ToastAndroid.show("Report deleted", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error deleting report:", error);
      setDeleting(false);
      ToastAndroid.show("Failed to delete report", ToastAndroid.LONG);
    }
  };

  return (
    <Portal>
      <Dialog
        visible={deleteReportVisible}
        onDismiss={() => hideDeleteReport()}
      >
        <Dialog.Title>Delete Report</Dialog.Title>
        <Dialog.Content>
          <Text>Are you sure you want to delete this report?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDeleteReport}>Cancel</Button>
          <Button disabled={isDeleting} onPress={handleDeleteReport}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

export default DeleteReport;