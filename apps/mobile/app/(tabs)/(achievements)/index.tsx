import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Alert,
  Dimensions,
} from "react-native";
import { Award, Gift, Sparkles, Bell, Check, Lock } from "lucide-react-native";

interface Props {
  darkMode?: boolean;
}

const { width } = Dimensions.get("window");

export default function RewardsComingSoonScreen({ darkMode = true }: Props) {
  const [notified, setNotified] = useState(false);

  // Floating animation for the central badge
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const handleNotifyMe = () => {
    setNotified(!notified);
    if (!notified) {
      Alert.alert(
        "You're on the list! 🎉",
        "We'll notify you as soon as the Rewards program goes live."
      );
    }
  };

  const bg =  "#FAF8F0";
  const text =  "#24221B";
  const muted = "#605E55";
  const cardBg =  "#ffffff";
  const border = "rgba(36,34,27,0.08)";

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Background Subtle Glowing Accent */}
      <View style={styles.glowAccent} />

      {/* Floating Hero Icon Stack */}
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ translateY: floatAnim }] },
        ]}
      >
        <View style={styles.mainBadge}>
          <Award size={48} color="#FAF8F0" />
        </View>

        {/* Decorative Surrounding Mini-Badges */}
        <View style={[styles.miniBadge, styles.miniBadgeLeft]}>
          <Gift size={16} color="#FAF8F0" />
        </View>
        <View style={[styles.miniBadge, styles.miniBadgeRight]}>
          <Sparkles size={16} color="#FAF8F0" />
        </View>
      </Animated.View>

      {/* Main Copy */}
      <View style={styles.textStack}>
        <View style={styles.tag}>
          <Lock size={12} color="#A88AED" style={{ marginRight: 4 }} />
          <Text style={styles.tagText}>UNDER DEVELOPMENT</Text>
        </View>

        <Text style={[styles.title, { color: text }]}>
          Rewards are on the Way!
        </Text>
        <Text style={[styles.subtitle, { color: muted }]}>
          Earn badges, unlock perks, and level up your status every time you check in at local happenings.
        </Text>
      </View>

      {/* Teaser Preview Card */}
      <View
        style={[
          styles.previewCard,
          { backgroundColor: cardBg, borderColor: border },
        ]}
      >
        <View style={styles.previewHeader}>
          <Text style={[styles.previewTitle, { color: text }]}>
            Upcoming Rewards Progress
          </Text>
          <Text style={styles.previewBadge}>Level 1</Text>
        </View>

        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>

        <View style={styles.previewFooter}>
          <Text style={[styles.previewFooterText, { color: muted }]}>
            0 / 100 XP to First Perk
          </Text>
          <Text style={[styles.previewFooterText, { color: "#A6C261" }]}>
            Coming Soon
          </Text>
        </View>
      </View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  glowAccent: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(168,138,237,0.12)",
    top: "20%",
  },
  iconContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  mainBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#A88AED",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#A88AED",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  miniBadge: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  miniBadgeLeft: {
    backgroundColor: "#A6C261",
    top: -4,
    left: -4,
  },
  miniBadgeRight: {
    backgroundColor: "#E59866",
    bottom: -4,
    right: -4,
  },
  textStack: {
    alignItems: "center",
    marginBottom: 32,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(168,138,237,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    marginBottom: 14,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A88AED",
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  previewCard: {
    width: width - 56,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 28,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  previewBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A88AED",
    backgroundColor: "rgba(168,138,237,0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(160,160,160,0.2)",
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBarFill: {
    width: "35%",
    height: "100%",
    backgroundColor: "#A88AED",
    borderRadius: 5,
  },
  previewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  previewFooterText: {
    fontSize: 11,
    fontWeight: "600",
  },
  notifyBtn: {
    width: width - 56,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#A88AED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#A88AED",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  notifyBtnActive: {
    backgroundColor: "#A6C261",
    shadowColor: "#A6C261",
  },
  notifyBtnText: {
    color: "#FAF8F0",
    fontSize: 15,
    fontWeight: "700",
  },
});