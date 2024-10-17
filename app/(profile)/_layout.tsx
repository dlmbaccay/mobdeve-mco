import { Stack } from 'expo-router'
import React from 'react'
import { StatusBar } from 'expo-status-bar'

const AuthLayout = () => {
  return (
    <>
        <Stack>
            <Stack.Screen name="user-profile" options={{ headerShown: false }} />
        </Stack>

        <StatusBar style="auto" />
    </>
  )
}

export default AuthLayout