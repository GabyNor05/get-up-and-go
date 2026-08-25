import { Header } from "@/components/textFormating";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Animated,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface Props {
  darkMode: boolean;
  toggleDark: () => void;
}

interface Activity {
  id: number;
  title: string;
  category: string;
  distance: string;
  img: string;
  rating: number;
}

const activities: Activity[] = [
  {
    id: 1,
    title: "Riverside Trail",
    category: "Nature",
    distance: "1.2 km",
    img: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=300&h=200&fit=crop&auto=format",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Morning Yoga at Crestview",
    category: "Wellness",
    distance: "0.8 km",
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=200&fit=crop&auto=format",
    rating: 4.6,
  },
  {
    id: 3,
    title: "Farmer's Market",
    category: "Community",
    distance: "2.1 km",
    img: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300&h=200&fit=crop&auto=format",
    rating: 4.9,
  },
  {
    id: 4,
    title: "Bike Loop — Lakefront",
    category: "Sports",
    distance: "3.5 km",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&auto=format",
    rating: 4.7,
  },
];

const notifications = [
  { icon: "👥", label: "New Circle Invite", sublabel: "from DesiP" },
  { icon: "✨", label: "Updated Features", sublabel: "Version 2.4 is live" },
  { icon: "🏅", label: "New Level Reached!!!", sublabel: "You hit Level 14" },
];

const categoryColors: Record<string, string> = {
  Nature: "#A6C261",
  Wellness: "#A88AED",
  Community: "#E8A84C",
  Sports: "#6CB8E8",
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function HomeScreen({ darkMode, toggleDark }: Props) {
  const [goalProgress] = useState(68);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: goalProgress,
      duration: 1000,
      useNativeDriver: false, // strokeDashoffset can't use the native driver
    }).start();
  }, [goalProgress]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [RING_CIRCUMFERENCE, 0],
  });

  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";

  function todayDate() {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    return today.toLocaleDateString("en-US", options);
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        
          <Header pageHeader="Welcome back!" subHeading={todayDate()} />
        

        <View style={{ paddingHorizontal: 24, paddingVertical: 8, gap: 20 }}>
          {/* Hero goal card */}
          <View
            style={{
              backgroundColor: surface,
              borderRadius: 22,
              padding: 22,
              borderWidth: 1,
              borderColor: border,
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
              shadowColor: "#24221B",
              shadowOpacity: darkMode ? 0 : 0.06,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 2 },
              elevation: darkMode ? 0 : 2,
            }}
          >
            {/* Ring */}
            <View style={{ width: 88, height: 88 }}>
              <Svg width={88} height={88} viewBox="0 0 88 88">
                <Circle
                  cx={44}
                  cy={44}
                  r={RING_RADIUS}
                  fill="none"
                  stroke={border}
                  strokeWidth={8}
                />
                <G rotation={-90} origin="44,44">
                  <AnimatedCircle
                    cx={44}
                    cy={44}
                    r={RING_RADIUS}
                    fill="none"
                    stroke="#A6C261"
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                  />
                </G>
              </Svg>
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Fredoka-SemiBold, sans-serif",
                    fontSize: 22,
                    fontWeight: "600",
                    color: "#A6C261",
                  }}
                >
                  {goalProgress}%
                </Text>
                <Text style={{ fontSize: 10, color: muted, marginTop: 2 }}>
                  done
                </Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Fredoka-SemiBold, sans-serif",
                  fontSize: 20,
                  fontWeight: "600",
                  color: text,
                }}
              >
                Daily Goal
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: muted,
                  marginTop: 4,
                  lineHeight: 19.5,
                }}
              >
                6,800 / 10,000 steps today
              </Text>
              <View
                style={{
                  marginTop: 10,
                  backgroundColor: "rgba(166,194,97,0.15)",
                  borderRadius: 10,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 14 }}>🔥</Text>
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#A6C261" }}
                >
                  3-day streak
                </Text>
              </View>
            </View>
          </View>

          {/* What's been happening */}
          <View>
            <Text
              style={{
                fontFamily: "Fredoka-SemiBold, sans-serif",
                fontSize: 18,
                fontWeight: "600",
                color: text,
                marginBottom: 12,
              }}
            >
              What's been happening
            </Text>
            <View
              style={{
                backgroundColor: surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: border,
                overflow: "hidden",
              }}
            >
              {notifications.map((n, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 14,
                    paddingHorizontal: 18,
                    borderBottomWidth: i < notifications.length - 1 ? 1 : 0,
                    borderBottomColor: border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{n.icon}</Text>
                    <View>
                      <Text
                        style={{ fontSize: 14, fontWeight: "500", color: text }}
                      >
                        {n.label}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: muted, marginTop: 1 }}
                      >
                        {n.sublabel}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ color: "#A88AED", fontSize: 16, opacity: 0.7 }}
                  >
                    ›
                  </Text>
                </View>
              ))}
            </View>
          </View>
          {/* Quick actions */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[
              { emoji: "🌟", label: "Trending Spots", color: "#A88AED" },
              { emoji: "📋", label: "Your Updates", color: "#A6C261" },
            ].map(({ emoji, label, color }) => (
              <Pressable
                key={label}
                style={{
                  flex: 1,
                  backgroundColor: surface,
                  borderWidth: 1,
                  borderColor: border,
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 16 }}>{emoji}</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color }}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Recommended activities */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontFamily: "Fredoka-SemiBold, sans-serif",
                  fontSize: 18,
                  fontWeight: "600",
                  color: text,
                }}
              >
                Recommended
              </Text>
              <Pressable>
                <Text
                  style={{ color: "#A88AED", fontSize: 13, fontWeight: "600" }}
                >
                  See all →
                </Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 14,
                paddingLeft: 24,
                paddingRight: 24,
              }}
              style={{ marginHorizontal: -24 }}
            >
              {activities.map((act) => (
                <ActivityCard
                  key={act.id}
                  activity={act}
                  darkMode={darkMode}
                  surface={surface}
                  border={border}
                  text={text}
                  muted={muted}
                />
              ))}
            </ScrollView>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

function ActivityCard({
  activity,
  darkMode,
  surface,
  border,
  text,
  muted,
}: {
  activity: Activity;
  darkMode: boolean;
  surface: string;
  border: string;
  text: string;
  muted: string;
}) {
  const catColor = categoryColors[activity.category] || "#A88AED";
  return (
    <View
      style={{
        width: 200,
        backgroundColor: surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: border,
        overflow: "hidden",
        shadowColor: "#24221B",
        shadowOpacity: darkMode ? 0 : 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        elevation: darkMode ? 0 : 2,
      }}
    >
      <View style={{ height: 120, backgroundColor: "#ddd" }}>
        <Image
          source={{ uri: activity.img }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        <View
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: catColor,
            borderRadius: 8,
            paddingVertical: 3,
            paddingHorizontal: 10,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#FAF8F0" }}>
            {activity.category}
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(0,0,0,0.45)", // no native blur — swap in expo-blur's BlurView for the glass look
            borderRadius: 8,
            paddingVertical: 3,
            paddingHorizontal: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 10, color: "#FAF8F0" }}>
            ⭐ {activity.rating}
          </Text>
        </View>
      </View>
      <View style={{ paddingVertical: 12, paddingHorizontal: 14 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: text,
            lineHeight: 18.2,
          }}
        >
          {activity.title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 6,
          }}
        >
          <Text style={{ fontSize: 12, color: muted }}>
            📍 {activity.distance} away
          </Text>
        </View>
      </View>
    </View>
  );
}
