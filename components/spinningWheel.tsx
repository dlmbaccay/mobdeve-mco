import React, { useEffect, useRef } from 'react';
import { Animated, View, useColorScheme } from 'react-native';
import lightWheel from '../assets/images/wheel-light.png';
import darkWheel from '../assets/images/wheel-dark.png';

const SpinningWheel = () => {
  const rotateValue = useRef(new Animated.Value(0)).current;

  const colorScheme = useColorScheme();

  const wheel = colorScheme === 'light' ? lightWheel : darkWheel;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000, // Duration of one complete rotation
        useNativeDriver: true, // Native driver for better performance
      })
    ).start();
  }, [rotateValue]);

  // Interpolate the rotation value to degrees
  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], // Spin from 0 to 360 degrees
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Animated.Image
        source={wheel}
        style={[{ width: 100, height: 100 }, animatedStyle]}
      />
    </View>
  );
};

export default SpinningWheel;