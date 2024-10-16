import React, { useState, useRef } from "react";
import { Animated, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { Modal, Text, Portal, Button, Divider, List, IconButton, useTheme } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import AddReport from "./addReport";

interface ViewReportProps {
  reportVisible: boolean;
  hideViewReport: () => void;
  reportsData: any;
  setMarkers: (markers: (prevMarkers: any[]) => any[]) => void;
}

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

const ViewReport = ({ reportVisible, hideViewReport, reportsData, setMarkers }: ViewReportProps) => {

  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [viewAddReport, setViewAddReport] = useState(false);
  const slideAnimation = useRef(new Animated.Value(300)).current;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const theme = useTheme();

  const handleAccordionPress = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderReportDetails = (report: ReportType) => (
    <View className="px-4 w-full">
      <View className="flex flex-row items-center justify-between mb-2">
        <View className="flex flex-row items-center justify-center w-fit">
          <Text className="text-xs">
            {report.firstName && report.lastName
              ? `${report.firstName} ${report.lastName}`
              : report.firstName ? report.firstName
              : report.lastName ? report.lastName
              : null}&nbsp;|
          </Text>
          <Text className="text-xs italic">
             &nbsp;{convertTimestamp(report.createdAt.toDate())}
          </Text>
        </View>

        { report.userId === auth().currentUser?.uid && (
          <View className="flex flex-row items-center justify-center">
            <IconButton
              icon="pencil"
              size={18}
              style= {{ margin: 0 }}
              onPress={() => {
                // TODO: Implement Edit Functionality
              }}
            />

            <IconButton
              icon="trash-can"
              size={18}
              style= {{ margin: 0 }}
              onPress={() => {
                // TODO: Implement Delete Functionality
              }}
            />
          </View>
        )}
      </View>

      {report.description ? (
        <>
          <Text className="text-s mb-2">{report.description}</Text>
        </>
      ) : null}

      {report.imageUrl ? (
        <>
          <TouchableOpacity onPress={() => setFullscreenImage(report.imageUrl)}>
            <Image
              source={{ uri: report.imageUrl }}
              style={{ width: "100%", height: 200, resizeMode: "contain", marginVertical: 10 }}
            />
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );

  const convertTimestamp = (createdAt: number) => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - createdAt) / 1000);

    if (diffInSeconds < 60) {
      return diffInSeconds === 1 ? "1 second ago" : `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  };

  return (
    <>
      <Portal>
        <Modal
          visible={reportVisible}
          onDismiss={hideViewReport}
          contentContainerStyle={{
            backgroundColor: theme.colors.background,
            paddingVertical: 15,
            margin: 20,
            borderRadius: 10,
            maxHeight: "85%",
          }}
        >
          {reportsData.length === 1 ? (
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between", minHeight: "60%" }} className="px-4 mt-3"
            >
              <View>
                <Text className="text-lg font-bold px-4 mb-1">{reportsData[0]?.title}</Text>
                {renderReportDetails(reportsData[0])}
              </View>

              <Button
                mode="text"
                className="rounded-md"
                onPress={() => {
                  setViewAddReport(true);
                  Animated.timing(slideAnimation, { toValue: 0, duration: 150, useNativeDriver: true }).start();
                }}
              >
                Add Report
              </Button>
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between", minHeight: "60%" }} className="px-4">
              <View>
                {reportsData.map((report: ReportType, index: number) => (
                  <List.Accordion
                    key={index}
                    title={report.title}
                    titleStyle={{ fontSize: 16, fontWeight: "bold" }}
                    description={convertTimestamp(report.createdAt.toDate())}
                    descriptionStyle={{ fontSize: 12, fontStyle: "italic", marginTop: 2 }}
                    expanded={expandedIndex === index}
                    onPress={() => handleAccordionPress(index)}
                  >
                    {renderReportDetails(report)}
                  </List.Accordion>
                ))}
              </View>

              <Button
                mode="text"
                className="rounded-md"
                onPress={() => {
                  setViewAddReport(true);
                  Animated.timing(slideAnimation, { toValue: 0, duration: 150, useNativeDriver: true }).start();
                }}
              >
                Add Report
              </Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      { viewAddReport && (
        <AddReport
          reportVisible={viewAddReport}
          hideReport={() => {
            Animated.timing(slideAnimation, { toValue: 300, duration: 150, useNativeDriver: true })
              .start(() => setViewAddReport(false));
          }}
          hideViewReport={hideViewReport}
          slideAnimation={slideAnimation}
          markerId={reportsData[0].markerId}
          latitude={reportsData[0].latitude}
          longitude={reportsData[0].longitude}
          setMarkers={setMarkers}
          isNewMarker={false}
        />
      )}

      {/* TODO: Implement Edit and Delete Functionalities */}

      {/* Fullscreen image modal */}
      <Portal>
        <Modal
          visible={!!fullscreenImage}
          onDismiss={() => setFullscreenImage(null)}
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0,
          }}
        >
          <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
            {fullscreenImage && (
              <TouchableOpacity onPress={() => setFullscreenImage(null)} style={{ width: '100%', height: '100%' }}>
                <Image
                  source={{ uri: fullscreenImage }}
                  style={{ width: "100%", height: "100%", resizeMode: "contain" }}
                />
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      </Portal>
    </>
  );
};

export default ViewReport;