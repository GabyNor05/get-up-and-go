import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  ArrowRight,
  Crown,
  MessageCircleMore,
  Users,
} from "lucide-react-native";
import type { CircleMember } from "./circle-data";

interface Props {
  member: CircleMember | null;
  darkMode: boolean;
  onClose: () => void;
  onViewProfile: (member: CircleMember) => void;
}

const SHEET_HEIGHT = 320;

export default function CircleMemberDrawer({
  member,
  darkMode,
  onClose,
  onViewProfile,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT - 84)).current;

  useEffect(() => {
    setExpanded(false);
    Animated.spring(translateY, {
      toValue: SHEET_HEIGHT - 84,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
  }, [member, translateY]);

  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = darkMode ? "#B8B6AC" : "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 90) {
            Animated.timing(translateY, {
              toValue: SHEET_HEIGHT,
              duration: 220,
              useNativeDriver: true,
            }).start(() => onClose());
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [onClose, translateY],
  );

  if (!member) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: expanded ? 420 : 280,
        backgroundColor: surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: border,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: -6 },
        elevation: 12,
        transform: [{ translateY }],
      }}
    >
      <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 8 }}>
        <View
          style={{
            width: 44,
            height: 5,
            borderRadius: 999,
            backgroundColor: `${member.color}60`,
          }}
        />
        <View
          style={{
            marginTop: 8,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 999,
            backgroundColor: `${member.color}15`,
          }}
        >
          <Text
            style={{ fontSize: 11, fontWeight: "700", color: member.color }}
          >
            Swipe up or tap the handle
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
      >
        <View style={{ alignItems: "center", marginTop: 6 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: member.color,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#FAF8F0" }}>
              {member.initial}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Fredoka-SemiBold",
              fontSize: 22,
              fontWeight: "700",
              color: text,
              marginTop: 10,
            }}
          >
            {member.name}
          </Text>
          <Text style={{ fontSize: 12, color: muted, marginTop: 4 }}>
            {member.email}
          </Text>
        </View>

        <View style={{ marginTop: 16, flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => onViewProfile(member)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor: `${member.color}20`,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: member.color }}
            >
              View profile
            </Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor: `${member.color}15`,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: text }}>
              Close
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            marginTop: 16,
            borderRadius: 18,
            backgroundColor: bg,
            borderWidth: 1,
            borderColor: border,
            padding: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Crown size={14} color={member.color} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: muted }}>
              Circle standing
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: text,
              marginTop: 6,
            }}
          >
            #{member.rank ?? "—"} in this circle
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 12,
            }}
          >
            <Users size={14} color={member.color} />
            <Text style={{ fontSize: 13, color: muted }}>
              {member.circles} circles joined
            </Text>
          </View>
        </View>

        {expanded && (
          <View
            style={{
              marginTop: 12,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: border,
              backgroundColor: `${member.color}08`,
              padding: 14,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: text }}>
              Recent momentum
            </Text>
            <Text style={{ fontSize: 12, color: muted, marginTop: 6 }}>
              Completed a 6 km route, shared a checkpoint, and stayed active
              across 3 circles this week.
            </Text>
            <Pressable
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MessageCircleMore size={14} color={member.color} />
              <Text
                style={{ fontSize: 12, fontWeight: "700", color: member.color }}
              >
                Send a nudge
              </Text>
              <ArrowRight size={14} color={member.color} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}
