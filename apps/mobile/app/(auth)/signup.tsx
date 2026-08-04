import { View, Pressable, Text, TextInput, Image } from "react-native";
import { Plus, UserRound } from "lucide-react-native";
import { useRouter } from "expo-router";
/* import gLogo from "../../assets/googleLogo.png"; */

export default function SignUpScreen() {
  const router = useRouter();

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

  const handleAvatarPick = () => {
    return alert("Avatar picker not implemented yet.");
  };

  return (
    <View className="Flex-1 mx-3 my-5 bg-[#FAF8F0] ">
      <Text>Sign Up</Text>

      {/* Avatar Picker */}
      <View className="flex items-center justify-center">
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
      <View>
        <View>
          <Text>Username</Text>
          <TextInput
            placeholder="Enter your username"
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            enterKeyHint="next"
          />
        </View>
        <View>
          <Text>Email</Text>
          <TextInput
            placeholder="Enter your email"
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            keyboardType="email-address"
            enterKeyHint="next"
          />
        </View>
        <View>
          <Text>Password</Text>
          <TextInput
            placeholder="Enter your password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            secureTextEntry
            enterKeyHint="done"
            /* inlineImageLeft={Eye} */
          />
        </View>
        <Pressable
          className="w-full rounded-lg bg-[#64539E] px-4 py-3 items-center justify-center"
          onPress={handleSignUp}
        >
          <Text> Sign Up</Text>
        </Pressable>
      </View>

      {/* Sign Up Alternatives */}
      <View className="flex-row w-full items-center justify-between">
        <Text>---------------</Text>
        <Text>OR</Text>
        <Text>---------------</Text>
      </View>
      {/* Google */}
      <View className="w-full rounded-lg bg-[#ffffff] px-4 py-3 items-center justify-center">
        <View className = "Flex flex-row items-center justify-center w-full bg-white">
          {/* <Image source={gLogo} className="size-6" /> */}
          <View className="size-6 bg-red-500 items-center justify-center">

          </View>
          <Text> Sign Up with Google</Text>
        </View>
      </View>
    </View>
  );
}
