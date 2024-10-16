import { View, Image, TouchableOpacity, Alert, ToastAndroid } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, TextInput, Text, useTheme } from "react-native-paper";
import bikeLogo from "../../assets/images/bike-logo.png";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";

// TODO: Implement Forgot Password

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);
  const theme = useTheme();

  const handleSignIn = () => {
    if (form.email === "" || form.password === "") {
      setSubmitting(true);

      Alert.alert(
        "Form Error!",
        "Please fill in the fields before submitting."
      );

      setSubmitting(false);
      return;
    }

    setSubmitting(true);

    auth()
    .signInWithEmailAndPassword(form.email, form.password)
    .then(() => {
      if (!auth().currentUser?.emailVerified) {
        Alert.alert(
          "Verify your email first",
          "An email verification has been sent to your email address. Please verify your email to continue"
        )

        setSubmitting(false);
        return;
      } else {
        setSubmitting(false);
        ToastAndroid.show("You're logged in!", ToastAndroid.SHORT);
        router.push("home");
      }
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        Alert.alert(
          "User not found",
          "User not found. Please check your email address and try again",
        );
      } else if (
        error.code === "auth/invalid-password" ||
        error.code === "auth/invalid-email" || error.code === "auth/invalid-credential"
      ) {
        Alert.alert(
          "Invalid email or password",
          "Please check your email and password and try again",
        );
      } else {
        console.log(error);
      }

      setSubmitting(false);
      return;
    })
    return;
  };

  return (
    <SafeAreaView className="h-full w-full" style={{ backgroundColor: theme.colors.background }}>
      <View className="h-full flex items-center justify-center">
        <View className="w-full flex flex-row items-center justify-center">
          <Image source={bikeLogo} className="w-28 h-28" resizeMode="contain" />
        </View>

        <View className="flex flex-col items-center justify-center w-full mt-6">
          <TextInput
            value={form.email}
            mode="outlined"
            label="Email Address"
            className="h-14 w-[90%] mt-6"
            onChangeText={(e: string) => setForm({ ...form, email: e })}
            style={{ backgroundColor: theme.colors.surface }}
          />

          <TextInput
            value={form.password}
            mode="outlined"
            label="Password"
            className="h-14 w-[90%] mt-4"
            secureTextEntry={!passwordVisible}
            right={
              <TextInput.Icon
                icon={passwordVisible ? "eye-off" : "eye"}
                onPress={() => setPasswordVisible(!passwordVisible)} 
              />
            }
            onChangeText={(e: string) => setForm({ ...form, password: e })}
            style={{ backgroundColor: theme.colors.surface }}
          />


          <TouchableOpacity
            className="w-[90%] mt-6"
            onPress={() => setForgotVisible(true)}
          >
            <Text className=" text-right text-sm">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          { forgotVisible && 
            <ForgotPassword
              forgotVisible={forgotVisible}
              hideForgotModal={() => setForgotVisible(false)}
            />
          }

          <Button
            mode="contained"
            onPress={handleSignIn}
            disabled={isSubmitting}
            className={`${isSubmitting ? "opacity-50" : "opacity-100"} w-[90%] h-14 flex items-center justify-center rounded-md mt-6`}
            style={{ backgroundColor: theme.colors.primary }}
          >
            <Text className="text-white text-lg font-bold">Login</Text>
          </Button>

          <View className="mt-4 mb-6 w-full flex flex-row items-center justify-center">
            <Text className="w-fit text-sm">Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push("sign-up")}
              className="w-fit ml-1"
            >
              <Text className="w-fit text-sm">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;