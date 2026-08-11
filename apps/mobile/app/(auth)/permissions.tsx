import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Camera, MapPin, Bell, ShieldLock, Info} from "lucide-react-native";
import { router } from "expo-router";
 
interface Props {
  darkMode: boolean;
  onContinue: () => void;
  onSkip: () => void;
}

function handleContinue(){
    router.push("/(tabs)/(home)");
}

export default function PermissionsScreen({ darkMode, onSkip }: Props){
  const [locationOn, setLocationOn] = useState(false);
  const [notifOn, setNotifOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
 
  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = darkMode ? "#B8B6AC" : "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";
 
  const permissions = [
    {
      icon: <MapPin size={24} color={ "#A88AED"} />,
      iconBg: "#A88AED",
      title: "Location Access",
      desc: "Allow location access for Get Up & Go to suggest area specific happenings.",
      on: locationOn,
      toggle: () => setLocationOn((v) => !v),
    },
    {
      icon: <Camera size={24} color={"#A88AED"} />,
      iconBg: "#A88AED",
      title: "Camera Access",
      desc: "Grant camera access to scan QR codes at Happenings you attend.",
      on: cameraOn,
      toggle: () => setCameraOn((v) => !v),
    },
    {
      icon: <Bell size={24} color={"#A88AED"} />,
      iconBg: "#A88AED",
      title: "Push Notifications",
      desc: "Get reminders for upcoming activities and circle updates.",
      on: notifOn,
      toggle: () => setNotifOn((v) => !v),
    },
  ];

    return(
         <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Main content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 }}>
        {/* Heading area */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: "rgba(168,138,237,0.15)",
              borderWidth: 1.5,
              borderColor: "rgba(168,138,237,0.25)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <ShieldLock size={36} color="#A88AED" />
          </View>
          <Text
            style={{
              fontFamily: "Fredoka-SemiBold, sans-serif",
              fontSize: 30,
              fontWeight: "500",
              color: text,
              lineHeight: 34.5,
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Enable Permissions
          </Text>
          <Text style={{ fontSize: 14, color: muted, lineHeight: 22.4, maxWidth: 280, textAlign: "center" }}>
            Allow access to enhance functionality and improve your experience.
          </Text>
        </View>
 
        {/* Permission cards */}
        <View style={{ gap: 14 }}>
          {permissions.map((p, i) => (
            <View
              key={i}
              style={{
                backgroundColor: surface,
                borderRadius: 20,
                borderWidth: p.on ? 1.5 : 1,
                borderColor: p.on ? `${p.iconBg}40` : border,
                paddingVertical: 18,
                paddingHorizontal: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                shadowColor: p.on ? p.iconBg : "transparent",
                shadowOpacity: p.on ? 0.13 : 0,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 4 },
                elevation: p.on ? 3 : 0,
              }}
            >
              {/* Icon */}
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: `${p.iconBg}20`,
                  borderWidth: 1.5,
                  borderColor: `${p.iconBg}35`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 22 }}>{p.icon}</Text>
              </View>
 
              {/* Text */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: text, marginBottom: 3 }}>{p.title}</Text>
                <Text style={{ fontSize: 12, color: muted, lineHeight: 18 }}>{p.desc}</Text>
              </View>
 
              {/* Toggle */}
              <Pressable
                onPress={p.toggle}
                style={{
                  width: 50,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: p.on ? p.iconBg : darkMode ? "rgba(250,248,240,0.12)" : "rgba(36,34,27,0.12)",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 3,
                    left: p.on ? 25 : 3,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: "#FAF8F0",
                    shadowColor: "#000",
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2,
                  }}
                />
              </Pressable>
            </View>
          ))}
        </View>
 
        {/* Info note */}
        <View
          style={{
            marginTop: 20,
            backgroundColor: "rgba(168,138,237,0.08)",
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: "rgba(168,138,237,0.15)",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <Info size={20} color="#A88AED" />
          <Text style={{ fontSize: 12, color: muted, lineHeight: 18, flex: 1 }}>
            You can change these permissions anytime in your device Settings.
          </Text>
        </View>
      </ScrollView>
 
      {/* Sticky bottom actions */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 24,
          backgroundColor: bg,
          borderTopWidth: 1,
          borderTopColor: border,
          gap: 12,
        }}
      >
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => ({
            backgroundColor: "#A88AED",
            borderRadius: 18,
            paddingVertical: 17,
            alignItems: "center",
            opacity: pressed ? 0.9 : 1,
            shadowColor: "#A88AED",
            shadowOpacity: 0.4,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: 6 },
            elevation: 5,
          })}
        >
          <Text style={{ color: "#FAF8F0", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}>
            Continue to App
          </Text>
        </Pressable>
        <Pressable onPress={onSkip} hitSlop={8} style={{ alignItems: "center", paddingVertical: 6 }}>
          <Text style={{ color: muted, fontSize: 14, fontWeight: "500" }}>Maybe Later</Text>
        </Pressable>
      </View>
    </View>
    );
}