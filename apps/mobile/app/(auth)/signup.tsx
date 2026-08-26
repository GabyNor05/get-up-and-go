import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Eye, EyeOff, Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { authService } from "../../../../packages/firebase/src/services/authService";
import { Header } from "@/components/textFormating";

const isNewUser = false;

const COLORS = {
  bg: "#F4F0DD",
  surface: "#FAF8F0",
  text: "#24221B",
  muted: "#605E55",
  border: "rgba(36,34,27,0.12)",
  inputBg: "#FFFFFF",
  primary: "#A88AED",
};

const AVATAR_PUBLIC_IDS = [
  "alghozy-_-uQyXaI9m0-unsplash_jgmzaa",
  "alghozy-0enEKclXSfw-unsplash_izsp2y",
  "alghozy-wQ_C9BkbpUM-unsplash_jk9694",
  "alghozy-y8cri7cZL3k-unsplash_vu2s4f",
  "alghozy-ILfPLj1DRLE-unsplash_ca2t1o",
  "alghozy-fABjaBlgYq4-unsplash_yglp8e",
  "alghozy--Y0bCuZ0-3o-unsplash_yujitr",
  "alghozy-lZAfGf19Cx0-unsplash_rspjty",
  "alghozy-YdnvVsFQOHc-unsplash_qnebat",
  "alghozy-6VKaOoQvHhI-unsplash_xhxnlo",
  "alghozy-9WGcoIFhxNk-unsplash_vd5xjz",
];

function cloudinaryAvatarUrl(publicId: string) {
  return `https://res.cloudinary.com/${process.env.EXPO_PUBLIC_CLOUDINARY_NAME}/image/upload/c_fill,g_auto,w_200,h_200,f_auto,q_auto/${publicId}`;
}

export default function SignUpScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username.trim()) {
      alert("Please enter a username.");
      return;
    }

    if (!selectedAvatar) {
      alert("Please select an avatar.");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Leverages authService to register Auth user, create User doc, generate GoerID, and create Goer doc
      await authService.signUp({
        email: email.trim(),
        password,
        username: username.trim(),
        role: "goer",
        avatarPublicId: selectedAvatar,
      });

      router.push("/onboarding");
    } catch (error: any) {
      alert(error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,

          padding: 24,
          paddingTop: 32,
          gap: 20,
        }}
      >
        <View className="my-4">
          <Header
            pageHeader="Create account"
            subHeading="Start exploring what's around you."
          />
        </View>
        {/* Avatar Selector */}
        <View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: COLORS.text,
              opacity: 0.7,
              marginBottom: 10,
            }}
          >
            Choose your avatar
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
          >
            {AVATAR_PUBLIC_IDS.map((id, i) => {
              const selected = selectedAvatar === id;
              return (
                <Pressable
                  key={`${id}-${i}`}
                  onPress={() => setSelectedAvatar(id)}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    overflow: "hidden",
                    borderWidth: selected ? 3 : 1.5,
                    borderColor: selected ? COLORS.primary : COLORS.border,
                    backgroundColor: COLORS.border,
                  }}
                >
                  <Image
                    source={{ uri: cloudinaryAvatarUrl(id) }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                  {selected && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: COLORS.primary,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1.5,
                        borderColor: COLORS.surface,
                      }}
                    >
                      <Check size={10} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
          {!selectedAvatar && (
            <Text style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 8 }}>
              Pick one to continue.
            </Text>
          )}
        </View>

        {/* Input Fields */}
        <View style={{ gap: 14 }}>
          <InputField
            label="Username"
            placeholder="choose_a_username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <InputField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputField
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            rightSlot={
              <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={8}>
                {showPw ? (
                  <EyeOff size={18} color={COLORS.muted} />
                ) : (
                  <Eye size={18} color={COLORS.muted} />
                )}
              </Pressable>
            }
          />
          <InputField
            label="Confirm Password"
            placeholder="Repeat your password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showConfirm}
            rightSlot={
              <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
                {showConfirm ? (
                  <EyeOff size={18} color={COLORS.muted} />
                ) : (
                  <Eye size={18} color={COLORS.muted} />
                )}
              </Pressable>
            }
          />
        </View>

        {/* Submit Button */}
       <Pressable
  onPress={handleSignUp}
  disabled={!selectedAvatar || loading}
  style={[
    styles.submitButton,
    { backgroundColor: selectedAvatar ? "#A88AED" : "#E2DFD2" },
  ]}
>
  {loading ? (
    <ActivityIndicator color="#FFFFFF" />
  ) : (
    <Text
      style={{
        color: selectedAvatar ? "#FFFFFF" : "#605E55",
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.3,
      }}
    >
      Sign Up
    </Text>
  )}
</Pressable>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 14, color: COLORS.muted }}>
            Already have an account?{" "}
          </Text>
          <Pressable onPress={handleLogin}>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.primary,
                fontWeight: "600",
              }}
            >
              Log In
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences";
  rightSlot?: React.ReactNode;
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightSlot,
}: InputFieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: COLORS.text,
          opacity: 0.7,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: COLORS.inputBg,
          borderWidth: 1.5,
          borderColor: COLORS.border,
          borderRadius: 14,
        }}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{
            flex: 1,
            paddingVertical: 13,
            paddingHorizontal: 16,
            color: COLORS.text,
            fontSize: 14,
          }}
        />
        {rightSlot && <View style={{ paddingRight: 14 }}>{rightSlot}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
});
