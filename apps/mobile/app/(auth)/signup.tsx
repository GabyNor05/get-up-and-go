import { View, Pressable, Text, TextInput, Image } from "react-native";
import { Plus, UserRound } from "lucide-react-native";
import { useRouter, Redirect } from "expo-router";
import { useFonts } from "expo-font";

const isNewUser = false;

export default function SignUpScreen() {
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

  if (isNewUser) {
    return <Redirect href="/signup" />;
  } 

/*  const [fontsLoaded] = useFonts({
    "A Day without Sun": require("../../../../packages/shared-ui/assets/fonts/A-Day-Without-Sun-Text-Bold-TRIAL.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  } */
 
  function Validate(email: string, password: string) {

  }

  const handleSignUp = () => {
    const isExistingUser = false;
    const isValid = true;

    if (!isExistingUser && isValid) {
      router.push("/onboarding");
    } else if (isExistingUser) {
      alert("User already exists. Please login.");
    } else {
      alert("Invalid email or password.");
    }
  };

  const handleLogin = () => {
    router.push("/(auth)");
  }

  const handleAvatarPick = () => {
    return alert("Avatar picker not implemented yet.");
  };

  return (
    <View className="Flex-1 justify-center px-4 h-full w-full bg-[#FAF8F0] ">
      <Text className="text-[#352C53] text-[40px] text-center mb-7 font-bold" 
      /* style={{ fontFamily: "A Day without Sun" }} */
      >
        Sign Up
      </Text>

      {/* Avatar Picker */}
      <View className="flex items-center justify-center mb-8">
        <View className="flex items-center justify-center size-36 rounded-full bg-[#C5D993]">
          <UserRound size={70} />
        </View>
        <Pressable
          className="size-12 absolute bottom-0 right-0 rounded-full bg-[#64539E] items-center justify-center"
          onPress={handleAvatarPick}
        >
          <Plus color="white" size={24} />
        </Pressable>
      </View>

      {/* Sign Up Form */}
      <View className="flex flex-col gap-4 ">
        <View className="flex flex-col gap-2">
          <Text>Username</Text>
          <TextInput
            placeholder="Enter your username"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 h-9"
            enterKeyHint="next"
          />
        </View>
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
          className="w-full h-10 rounded-lg bg-[#64539E] px-4 py-3 items-center justify-center mt-4 mb-8"
          onPress={handleSignUp}
        >
          <Text className="text-white"> Sign Up</Text>
        </Pressable>
      </View>

       <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 4 }}>
            <Text style={{ fontSize: 14, color: COLORS.muted }}>Already have an account? </Text>
            <Pressable onPress={handleLogin}>
              <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: "600" }}>Log In</Text>
            </Pressable>
          </View>
    </View>
  );
}
