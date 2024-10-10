import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

const RootLayout = () => {
  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* <Stack.Screen name="(auth)" options={{ headerShown: false }} /> */}
        {/* <Stack.Screen name="(home)" options={{ headerShown: false }} /> */}
        {/* <Stack.Screen name="(profile)" options={{ headerShown: false }} /> */}
      </Stack>
    </PaperProvider>
  );
};

export default RootLayout;