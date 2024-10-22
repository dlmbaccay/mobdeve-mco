import { Stack } from "expo-router";
import { useColorScheme } from 'react-native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { useFonts, Poppins_300Light, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect }from 'react';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();
  const [ loaded, error ] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const paperTheme =
    colorScheme === 'light'
      ? { ...MD3LightTheme, colors: theme.light }
      : { ...MD3DarkTheme, colors: theme.dark };

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  
  return (
    <PaperProvider theme={paperTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(profile)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
};

export default RootLayout;