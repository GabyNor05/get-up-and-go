import { useEffect, useRef, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, Animated, Dimensions, NativeSyntheticEvent, NativeTouchEvent } from "react-native";
import { UserPlus } from "lucide-react-native";
import { CIRCLES } from "../circles-data";

interface Props {
  darkMode: boolean;
  circleId: number | null;
  onClose: () => void;
  onViewProfile: (circleId: number, userId: string) => void;
  onLeaveCircle: (circleId: number) => void;
  onInviteUser: (circleId: number) => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_THRESHOLD = 120;

export default function CirclesMembersDrawer({ darkMode, circleId, onClose, onViewProfile, onLeaveCircle, onInviteUser }: Props) {
  const visible = circleId !== null;
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragStartY = useRef<number | null>(null);
  const dragOffset = useRef(0);

  const circle = circleId !== null ? CIRCLES.find((c) => c.id === circleId) : undefined;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(SCREEN_HEIGHT);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 14 }).start();
    } else if (mounted) {
      Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 220, useNativeDriver: true }).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 220, useNativeDriver: true }).start(() => {
      setMounted(false);
      onClose();
    });
  };

  const handleDragStart = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    dragStartY.current = e.nativeEvent.touches[0].pageY;
  };
  const handleDragMove = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (dragStartY.current === null) return;
    const dy = e.nativeEvent.touches[0].pageY - dragStartY.current;
    dragOffset.current = Math.max(0, dy);
    translateY.setValue(dragOffset.current);
  };
  const handleDragEnd = () => {
    if (dragOffset.current > DISMISS_THRESHOLD) handleClose();
    else Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
    dragStartY.current = null;
    dragOffset.current = 0;
  };

  if (!mounted || !circle) return null;

  const surface = darkMode ? "#2D2B22" : "#FFFFFF";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = darkMode ? "#B8B6AC" : "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";
  const rowBg = darkMode ? "#24221B" : "#FAF8F0";

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1 }}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(26,26,26,0.5)" }} onPress={handleClose} />
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: "85%",
            backgroundColor: darkMode ? "#1A1A1A" : "#F4F0DD",
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            transform: [{ translateY }],
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -6 },
            elevation: 12,
          }}
        >
          <View onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd} style={{ paddingTop: 10, paddingBottom: 6, alignItems: "center" }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: border }} />
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontFamily: "Fredoka-SemiBold", fontSize: 24, fontWeight: "700", color: text, textAlign: "center", marginBottom: 16 }}>
              {circle.name}
            </Text>

            {/* You (Admin) */}
            <View style={{ backgroundColor: surface, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${circle.accent}30`, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: circle.accent }}>Y</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: text }}>You (Admin)</Text>
              </View>
              <View style={{ backgroundColor: rowBg, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: muted }}>That's you</Text>
              </View>
            </View>

            {/* Circlees list */}
            <View style={{ backgroundColor: surface, borderRadius: 16, padding: 14, marginBottom: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: text, marginBottom: 10 }}>Circlees</Text>
              {circle.members.map((m, i) => (
                <View
                  key={m.userId}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: border }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, marginRight: 8 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: `${circle.accent}25`, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: circle.accent }}>{m.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13.5, fontWeight: "700", color: text }}>{m.name}</Text>
                      <Text style={{ fontSize: 11.5, color: muted }} numberOfLines={1}>{m.email}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => onViewProfile(circle.id, m.userId)} style={{ backgroundColor: rowBg, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: text }}>View Profile</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
              <Pressable
                onPress={() => onLeaveCircle(circle.id)}
                style={{ flex: 1, borderWidth: 1.5, borderColor: darkMode ? "#FAF8F0" : "#24221B", borderRadius: 14, paddingVertical: 13, alignItems: "center" }}
              >
                <Text style={{ fontSize: 13.5, fontWeight: "700", color: text }}>Leave Circle</Text>
              </Pressable>
              <Pressable
                onPress={() => onInviteUser(circle.id)}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#352C53", borderRadius: 14, paddingVertical: 13 }}
              >
                <UserPlus size={15} color="#fff" />
                <Text style={{ fontSize: 13.5, fontWeight: "700", color: "#fff" }}>Invite User</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}