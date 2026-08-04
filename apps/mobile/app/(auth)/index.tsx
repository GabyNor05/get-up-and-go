import { View, Text, Pressable } from "react-native";
import { Redirect } from "expo-router";

import "../../global.css";

const isNewUser = false;

const LoginScreen = () => {
  if (!isNewUser) {
    return <Redirect href="/signup" />;
  }

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white p-6">
      <Text className="text-lg font-semibold">Login screen</Text>

      <Pressable
        className="w-full rounded-md bg-red-500 px-4 py-3"
        onPress={() => {}}
      >
        <Text className="text-center font-medium text-white">Sign Up</Text>
      </Pressable>

      <Pressable
        className="w-full rounded-md bg-blue-500 px-4 py-3"
        onPress={() => {}}
      >
        <Text className="text-center font-medium text-white">Sign In</Text>
      </Pressable>
    </View>
  );
};

export default LoginScreen;
