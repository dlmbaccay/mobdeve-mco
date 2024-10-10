import { StatusBar } from 'expo-status-bar';
import { Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import bikeLogo from "../assets/images/bike-logo.png";

export default function App() {
  return (
    <SafeAreaView className="h-full w-full">
      <View className='w-full h-[90vh] flex items-center justify-center'>
        <Image source={bikeLogo} className="w-40 h-40" resizeMode="contain" />
        <Text className='text-xl font-bold w-40 text-center'>Loading...</Text>
      </View>
    </SafeAreaView>
  );
}