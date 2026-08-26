import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Animated,
  Dimensions,
  StyleSheet,
  Alert,
  Share,
} from "react-native";
import {
  User as UserIcon,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Code2,
  Share2,
  Pencil,
  X,
  Sliders,
  ShieldCheck,
} from "lucide-react-native";
import { getAuth, signOut } from "firebase/auth";
import { useGoer } from "../../../hooks/useGoer";

interface Props {
  darkMode?: boolean;
  toggleDark?: () => void;
  onNavigateDev?: () => void;
}

type DrawerType = "edit_profile" | "preferences" | "privacy" | "help" | null;

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function SettingsScreen({
  darkMode = false,
  toggleDark,
  onNavigateDev,
}: Props) {
  const { goerId, username } = useGoer();
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);

  // Settings Toggles State
  const [pushNotifications, setPushNotifications] = useState(true);
  const [hideEmail, setHideEmail] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  // Side Drawer Slide Animation
  const drawerAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const openDrawer = (type: DrawerType) => {
    setActiveDrawer(type);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActiveDrawer(null);
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (err) {
      Alert.alert("Logout Error", "Failed to sign out cleanly.");
    }
  };

  const handleShareProfile = () => {
    Share.share({
      message: `Check out @${username} on the app! User ID: ${goerId || "N/A"}`,
    }).catch(() => {});
  };

  // Dedicated Light Theme Palette
  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const textPrimary = darkMode ? "#FAF8F0" : "#24221B";
  const muted = "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";
  const accent = "#A88AED";
  const chipBg = darkMode ? "rgba(168,138,237,0.18)" : "rgba(168,138,237,0.14)";

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Settings</Text>

        {/* Profile Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: surface, borderColor: border },
          ]}
        >
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: accent }]}>
              <Text style={styles.avatarText}>
                {username ? username.charAt(0).toUpperCase() : "G"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameBadgeRow}>
                <Text style={[styles.profileName, { color: textPrimary }]}>
                  {username || "Goer Member"}
                </Text>
                <ShieldCheck size={16} color={accent} />
              </View>
              <Text style={[styles.profileSub, { color: muted }]}>
                Goer Account
              </Text>
              <Text style={[styles.userId, { color: accent }]}>
                ID: {goerId ? `${goerId.slice(0, 10)}...` : "Loading..."}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => openDrawer("edit_profile")}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: chipBg },
                pressed && { opacity: 0.75 },
              ]}
            >
              <Pencil size={14} color={accent} />
              <Text style={[styles.actionBtnText, { color: accent }]}>
                Edit Profile
              </Text>
            </Pressable>

            <Pressable
              onPress={handleShareProfile}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: chipBg },
                pressed && { opacity: 0.75 },
              ]}
            >
              <Share2 size={14} color={accent} />
              <Text style={[styles.actionBtnText, { color: accent }]}>
                Share
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Appearance Control */}
        {toggleDark && (
          <View
            style={[
              styles.cardGroup,
              { backgroundColor: surface, borderColor: border },
            ]}
          >
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: chipBg }]}>
                  <Sliders size={16} color={accent} />
                </View>
                <Text style={[styles.rowLabel, { color: textPrimary }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleDark}
                trackColor={{ false: "rgba(36,34,27,0.15)", true: accent }}
                thumbColor="#FAF8F0"
              />
            </View>
          </View>
        )}

        {/* Primary Settings Links */}
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: surface, borderColor: border },
          ]}
        >
          <Pressable
            onPress={() => openDrawer("preferences")}
            style={({ pressed }) => [
              styles.rowItem,
              pressed && styles.pressed,
              { borderBottomWidth: 1, borderColor: border },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBadge, { backgroundColor: chipBg }]}>
                <Bell size={16} color={accent} />
              </View>
              <Text style={[styles.rowLabel, { color: textPrimary }]}>
                Preferences
              </Text>
            </View>
            <ChevronRight size={18} color={muted} />
          </Pressable>

          <Pressable
            onPress={() => openDrawer("privacy")}
            style={({ pressed }) => [
              styles.rowItem,
              pressed && styles.pressed,
              { borderBottomWidth: 1, borderColor: border },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBadge, { backgroundColor: chipBg }]}>
                <Lock size={16} color={accent} />
              </View>
              <Text style={[styles.rowLabel, { color: textPrimary }]}>
                Privacy & Security
              </Text>
            </View>
            <ChevronRight size={18} color={muted} />
          </Pressable>

          <Pressable
            onPress={() => openDrawer("help")}
            style={({ pressed }) => [styles.rowItem, pressed && styles.pressed]}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBadge, { backgroundColor: chipBg }]}>
                <HelpCircle size={16} color={accent} />
              </View>
              <Text style={[styles.rowLabel, { color: textPrimary }]}>
                Help & Support
              </Text>
            </View>
            <ChevronRight size={18} color={muted} />
          </Pressable>
        </View>

        {/* Developer Portal Option */}
        {onNavigateDev && (
          <View
            style={[
              styles.cardGroup,
              { backgroundColor: surface, borderColor: border },
            ]}
          >
            <Pressable
              onPress={onNavigateDev}
              style={({ pressed }) => [
                styles.rowItem,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: chipBg }]}>
                  <Code2 size={16} color={accent} />
                </View>
                <Text style={[styles.rowLabel, { color: accent, fontWeight: "600" }]}>
                  Dev Portal & QR Generator
                </Text>
              </View>
              <ChevronRight size={18} color={accent} />
            </Pressable>
          </View>
        )}

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { opacity: 0.8 },
          ]}
        >
          <LogOut size={16} color="#E8786C" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      {/* Drawer Overlay */}
      {activeDrawer !== null && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          <Pressable style={styles.backdrop} onPress={closeDrawer} />

          <Animated.View
            style={[
              styles.sideDrawer,
              {
                backgroundColor: surface,
                borderColor: border,
                transform: [{ translateX: drawerAnim }],
              },
            ]}
          >
            <View style={[styles.drawerHeader, { borderBottomColor: border }]}>
              <Text style={[styles.drawerTitle, { color: textPrimary }]}>
                {activeDrawer === "edit_profile" && "Edit Profile"}
                {activeDrawer === "preferences" && "Preferences"}
                {activeDrawer === "privacy" && "Privacy & Security"}
                {activeDrawer === "help" && "Help & Support"}
              </Text>
              <Pressable onPress={closeDrawer} hitSlop={10}>
                <X size={20} color={textPrimary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {activeDrawer === "preferences" && (
                <View style={{ gap: 20 }}>
                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={[styles.toggleLabel, { color: textPrimary }]}>
                        Push Notifications
                      </Text>
                      <Text style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                        Receive alerts for nearby happenings
                      </Text>
                    </View>
                    <Switch
                      value={pushNotifications}
                      onValueChange={setPushNotifications}
                      trackColor={{ false: "rgba(36,34,27,0.15)", true: accent }}
                      thumbColor="#FAF8F0"
                    />
                  </View>
                </View>
              )}

              {activeDrawer === "privacy" && (
                <View style={{ gap: 20 }}>
                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={[styles.toggleLabel, { color: textPrimary }]}>
                        Hide Email Address
                      </Text>
                      <Text style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                        Keep email address hidden from public profile
                      </Text>
                    </View>
                    <Switch
                      value={hideEmail}
                      onValueChange={setHideEmail}
                      trackColor={{ false: "rgba(36,34,27,0.15)", true: accent }}
                      thumbColor="#FAF8F0"
                    />
                  </View>

                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={[styles.toggleLabel, { color: textPrimary }]}>
                        Location Sharing
                      </Text>
                      <Text style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                        Share coarse location for nearby happenings
                      </Text>
                    </View>
                    <Switch
                      value={locationSharing}
                      onValueChange={setLocationSharing}
                      trackColor={{ false: "rgba(36,34,27,0.15)", true: accent }}
                      thumbColor="#FAF8F0"
                    />
                  </View>
                </View>
              )}

              {(activeDrawer === "edit_profile" || activeDrawer === "help") && (
                <Text style={{ color: muted, fontSize: 14 }}>
                  Section options coming soon...
                </Text>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 120,
  },
  headerTitle: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  nameBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#A88AED",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarText: {
    color: "#FAF8F0",
    fontSize: 26,
    fontWeight: "700",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
  },
  profileSub: {
    fontSize: 12,
    marginTop: 2,
  },
  userId: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  cardGroup: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  rowItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(232,120,108,0.10)",
    borderWidth: 1,
    borderColor: "rgba(232,120,108,0.25)",
    borderRadius: 18,
    paddingVertical: 15,
    marginTop: 8,
  },
  logoutText: {
    color: "#E8786C",
    fontSize: 15,
    fontWeight: "700",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sideDrawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: "82%",
    borderLeftWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});