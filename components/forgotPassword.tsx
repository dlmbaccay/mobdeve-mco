import { Portal, Modal, Button, IconButton, TextInput, Text, useTheme } from "react-native-paper";
import { View, Alert, ToastAndroid, useColorScheme, Image } from "react-native";
import auth from "@react-native-firebase/auth";
import { useState } from "react";
import repairLight from "../assets/images/repair-light.png";
import repairDark from "../assets/images/repair-dark.png";

interface ForgotPasswordProps {
  forgotVisible: boolean;
  hideForgotModal: () => void;
}

const ForgotPassword = ({ forgotVisible, hideForgotModal }: ForgotPasswordProps) => {

  const [email, setEmail] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const repair = colorScheme === "light" ? repairLight : repairDark;

  /**
   * handleForgotPassword
   * - Function to send a password reset email
   * - Sends a password reset email to the provided email address
   * - Only sends an email if the email address is valid
   */
  const handleForgotPassword = async () => {
    if (email === "") {
      Alert.alert("Form Error!", "Please fill in the email address field");
      return;
    } else if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Error!", "A valid email address is required");
      return;
    }

    setSubmitting(true);

    await auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        ToastAndroid.show("Password reset email sent", ToastAndroid.SHORT);
        hideForgotModal();
      })
      .catch((error) => {
        if (error.code === "auth/user-not-found") {
          Alert.alert("Error", "Email address not found");
        } else {
          Alert.alert("Error", "An error occurred. Please try again later");
        }
      })
      .finally(() => {
        setSubmitting(false);
        hideForgotModal();
      });
  };

  return (
    <Portal>
      <Modal
        visible={forgotVisible}
        onDismiss={hideForgotModal}
        contentContainerStyle={{
          backgroundColor: theme.colors.background,
          padding: 20,
        }}
      >

        <View className="h-full flex flex-col items-center justify-center pb-6">
          <IconButton
            icon="close"
            onPress={hideForgotModal}
            className="absolute top-0 left-0 p-0 m-0"
          />

          <Image source={repair} style={{ width: 125, height: 125 }} resizeMode="contain" />
          <Text className="text-lg font-bold w-full text-center">Forgot Your Password?</Text>
          <Text className="text-sm mt-2 mb-2 w-full text-center">Enter your email address to reset your password</Text>

          <TextInput
            mode="outlined"
            value={email}
            onChangeText={(text) => setEmail(text)}
            label="Email Address"
            className="w-full h-14 mt-2 text-base"
            style={{ backgroundColor: theme.colors.surface }}
          />

          <Button mode="contained" compact={true} onPress={handleForgotPassword} className={`${isSubmitting ? "opacity-50" : "opacity-100"} mt-6 h-14 flex flex-col items-center justify-center px-2 rounded-md w-full`} disabled={isSubmitting} style={{ backgroundColor: theme.colors.primary }}>
              <Text className="text-base" style={{ color: theme.colors.onPrimary, fontWeight: "bold" }}>Reset Password</Text>
          </Button>
        </View>
      </Modal>
    </Portal>
  );
} 

export default ForgotPassword;