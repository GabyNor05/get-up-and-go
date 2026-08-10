import { View, Text, Pressable, TextInput } from "react-native";
import { Redirect, useRouter } from "expo-router";


const isNewUser = true;

const LoginScreen = () => {
  const router = useRouter();

  const COLORS = {
  bg: "#F4F0DD",
  surface: "#FAF8F0",
  text: "#24221B",
  muted: "#605E55",
  border: "rgba(36,34,27,0.12)",
  inputBg: "#FFFFFF",
  primary: "#A88AED",
};

  

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

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <View className="Flex-1 justify-center px-4 h-full w-full bg-[#FAF8F0] ">
      <Text className="text-[#352C53] text-[40px] text-center mb-7 font-bold" style={{fontFamily: "Fredoka-SemiBold, sans-serif", // requires font loading — see commented useFonts above
                fontSize: 42,
                fontWeight: "600",}}>Login</Text>

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
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 4 }}>
            <Text style={{ fontSize: 14, color: COLORS.muted }}>Don&apos;t have an account? </Text>
            <Pressable onPress={handleSignUp}>
              <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: "600" }}>Sign Up</Text>
            </Pressable>
          </View>
    </View>
  );
};

export default LoginScreen;
