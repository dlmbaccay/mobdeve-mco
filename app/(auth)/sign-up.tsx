import { View, ScrollView, Image, TouchableOpacity, Alert, useColorScheme } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, TextInput, Text, useTheme, HelperText } from "react-native-paper";
import { router } from "expo-router";
import bikeLogoLight from "../../assets/images/bike-logo-light.png";
import bikeLogoDark from "../../assets/images/bike-logo-dark.png";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const SignUp = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPaswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const bikeLogo = colorScheme === "light" ? bikeLogoLight : bikeLogoDark;

  /**
   * handleSignUp
   * - Function to handle user sign up
   * - Signs up user using Firebase Auth
   * - Saves user details to Firestore
   * - Sends email verification to user
   * - Navigates to sign in page if successful
   * 
   */
  const handleSignUp = async () => {
    setSubmitting(true);

    if ( // check if any field is empty
      form.firstName === "" ||
      form.lastName === "" ||
      form.email === "" ||
      form.password === "" ||
      form.confirmPassword === ""
    ) {
      Alert.alert(
        "All fields are required",
        "Please fill in all fields before submitting."
      );
      setSubmitting(false);
      return;
    } else if (!form.email.includes("@") || !form.email.includes(".")) { // check if email is valid
      Alert.alert("Error", "Invalid email address");
      setSubmitting(false);
      return;
    } else if (form.password.length < 6) { // check if password is at least 6 characters
      Alert.alert("Error", "Password must be at least 6 characters");
      setSubmitting(false);
      return;
    } else if (form.password !== form.confirmPassword) { // check if passwords match
      Alert.alert("Error", "Passwords do not match");
      setSubmitting(false);
      return;
    }

    await auth()
    .createUserWithEmailAndPassword(form.email, form.password) // create user
    .then((response) => {
      // send email verification
      auth().currentUser?.sendEmailVerification();

      // save user details to firestore with default avatar URL
      firestore().collection("users").doc(response.user.uid).set({
        uid: response.user.uid,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        createdAt: new Date(),
        avatarUrl:
          "https://firebasestorage.googleapis.com/v0/b/bike-app-ca815.appspot.com/o/default-avatar-icon.png?alt=media&token=2682e441-d460-4a67-9af4-1c446e196244", // Pre-uploaded default avatar
      });

      Alert.alert(
        "Account Created!",
        "Please verify your email address to login.",
      );
      
      setSubmitting(false);
      
      // redirect to sign in page
      router.push("sign-in");
    })
    .catch((error) => {
      if (error.code === "auth/email-already-in-use") { 
        Alert.alert("Error", "Email address already in use");
        setSubmitting(false);
      } else {
        console.log(error);
        Alert.alert("Error", error.message);
        setSubmitting(false);
      }
    });
  };

  const passwordErrors = () => {
    return form.password.length < 6 ? "Password must be at least 6 characters" : "";
  }

  const confirmPasswordErrors = () => {
    return form.password !== form.confirmPassword ? "Passwords do not match" : "";
  }

  return (
    <SafeAreaView className="h-full w-full" style={{ backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ alignContent: "center", justifyContent: "center", height: "100%" }}>
        <View className="w-full flex flex-row items-center justify-center">
          <Image source={bikeLogo} className="w-[60px] h-[60px]" resizeMode="contain" />

          <Text className="text-[55px] mt-4 pl-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>
            BikeSafe
          </Text>
        </View>

        <View className="flex flex-col items-center justify-center w-full">
          <TextInput
            value={form.firstName}
            mode="outlined"
            label="First Name"
            className="h-14 w-[90%] mt-2"
            onChangeText={(e: string) => setForm({ ...form, firstName: e })}
            style={{ backgroundColor: theme.colors.surface }}
          />

          <TextInput
            value={form.lastName}
            mode="outlined"
            label="Last Name"
            className="h-14 w-[90%] mt-4"
            onChangeText={(e: string) => setForm({ ...form, lastName: e })}
            style={{ backgroundColor: theme.colors.surface }}
          />

          <TextInput
            value={form.email}
            mode="outlined"
            label="Email Address"
            className="h-14 w-[90%] mt-4"
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

          { passwordErrors() !== "" && (
            <HelperText type="error" visible={passwordErrors() !== ""} className="w-[90%] mt-1">
              {passwordErrors()}
            </HelperText>
          )}

          <TextInput
            value={form.confirmPassword}
            mode="outlined"
            label="Confirm Password"
            className={`h-14 w-[90%] ${passwordErrors() !== "" ? "mt-2" : "mt-4"}`}
            secureTextEntry={!confirmPaswordVisible}
            right={
              <TextInput.Icon
                icon={confirmPaswordVisible ? "eye-off" : "eye"}
                onPress={() => setConfirmPasswordVisible(!confirmPaswordVisible)}
              />
            }
            onChangeText={(e: string) => setForm({ ...form, confirmPassword: e })}
            style={{ backgroundColor: theme.colors.surface }}
          />

          { confirmPasswordErrors() !== "" && (
            <HelperText type="error" visible={confirmPasswordErrors() !== ""} className="w-[90%] mt-1">
              {confirmPasswordErrors()}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSignUp}
            disabled={isSubmitting}
            className={`${isSubmitting ? "opacity-50" : "opacity-100"} w-[90%] h-14 flex justify-center rounded-md ${confirmPasswordErrors() !== "" ? 'mt-4' : 'mt-8'}`}
            style={{ backgroundColor: theme.colors.primary }}
          >
            <Text className="text-base" style={{ color: theme.colors.onPrimary, fontWeight: "bold" }}>Sign Up</Text>
          </Button>

          <View className="mt-4 mb-14 w-full flex flex-row items-center justify-center">
            <Text className="w-fit text-sm">Already have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push("sign-in")}
              className="w-fit ml-1"
            >
              <Text className="w-fit text-sm">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;