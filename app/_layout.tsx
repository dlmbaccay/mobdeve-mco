import { Stack } from "expo-router";
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

const RootLayout = () => {
  const { theme } = useMaterial3Theme();
  const lightTheme = {
    ...MD3LightTheme,
    colors: theme.light,
  };

  return (
    <PaperProvider theme={lightTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* TODO: implement */}
        {/* <Stack.Screen name="(profile)" options={{ headerShown: false }} /> */}
      </Stack>
    </PaperProvider>
  );
};

export default RootLayout;