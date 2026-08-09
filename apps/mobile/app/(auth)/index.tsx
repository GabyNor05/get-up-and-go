import { View, Text, Pressable, TextInput } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { auth, db } from "@get-up-and-go/firebase";

const isNewUser = true;

const LoginScreen = () => {
  const router = useRouter();
  if (!isNewUser) {
    return <Redirect href="/signup" />;
  }

   const handleLogin = () => {
    const isValid = true;

    if (isNewUser && isValid) {
      router.push("./(tabs)");
    } else if (!isNewUser) {
      alert("Cannot find user. Please Sign In.");
    } else {
      alert("Invalid email or password.");
    }
  };

  return (
    <View className="Flex-1 justify-center px-4 h-full w-full bg-[#FAF8F0] ">
      <Text className="text-[#352C53] text-[40px] text-center mb-7 font-bold">Login screen</Text>

      <View className="flex flex-col gap-4 ">
        <View className="flex flex-col gap-2 ">
          <Text>Email</Text>
          <TextInput
            placeholder="Enter your email"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 h-9"
            keyboardType="email-address"
            enterKeyHint="next"
          />
        </View>
        <View className="flex flex-col gap-2 ">
          <Text>Password</Text>
          <TextInput
            placeholder="Enter your password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 h-9"
            secureTextEntry
            enterKeyHint="done"
            /* inlineImageLeft={Eye} */
          />
        </View>
        <Pressable
          className="w-full h-10 rounded-lg bg-[#64539E] px-4 py-3 items-center justify-center mb-8"
          onPress={handleLogin}
        >
          <Text className="text-white">Login</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default LoginScreen;
