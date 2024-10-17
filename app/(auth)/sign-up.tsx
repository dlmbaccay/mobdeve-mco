import { View, ScrollView, Image, TouchableOpacity, Alert, useColorScheme } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, TextInput, Text, useTheme } from "react-native-paper";
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

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPaswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const colorScheme = useColorScheme();
  const bikeLogo = colorScheme === "light" ? bikeLogoLight : bikeLogoDark;

  const theme = useTheme();

  const handleSignUp = async () => {

    setSubmitting(true);

    if (
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
    } else if (!form.email.includes("@") || !form.email.includes(".")) {
      Alert.alert("Error", "Invalid email address");
      setSubmitting(false);
      return;
    } else if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      setSubmitting(false);
      return;
    } else if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      setSubmitting(false);
      return;
    }

    try {
      await auth()
        .createUserWithEmailAndPassword(form.email, form.password)
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
          console.log(error);
          Alert.alert("Error", error.message);
          setSubmitting(false);
        });
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", error.message);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="h-full w-full" style={{ backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ alignContent: "center", justifyContent: "center", height: "100%" }}>
        <View className="w-full flex flex-row items-center justify-center">
          <Image source={bikeLogo} className="w-[150px] h-[150px]" resizeMode="contain" />
        </View>

        <View className="flex flex-col items-center justify-center w-full">
          <TextInput
            value={form.firstName}
            mode="outlined"
            label="First Name"
            className="h-14 w-[90%] mt-4"
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

          <TextInput
            value={form.confirmPassword}
            mode="outlined"
            label="Confirm Password"
            className="h-14 w-[90%] mt-4"
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

          <Button
            mode="contained"
            onPress={handleSignUp}
            disabled={isSubmitting}
            className={`${isSubmitting ? "opacity-50" : "opacity-100"} w-[90%] h-14 flex items-center justify-center rounded-md mt-8`}
            style={{ backgroundColor: theme.colors.primary }}
          >
            <Text className="text-lg" style={{ color: theme.colors.onPrimary, fontWeight: "bold" }}>Sign Up</Text>
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