import { View, Text, Pressable, StyleSheet } from "react-native";
import { Bookmark, MapPin, Clock, Image as ImageIcon } from "lucide-react-native";
import { Image } from "expo-image";
import type { Happening } from "../../../../packages/firebase/src/types/happening";

// Palette exact match to CirclesScreen
const CATEGORY_COLORS: Record<
  string,
  { accent: string; cardBg: { light: string; dark: string } }
> = {
  NATURE: { accent: "#A6C261", cardBg: { light: "#F5F8EC", dark: "#262B1D" } },
  MUSIC: { accent: "#A88AED", cardBg: { light: "#F6F2FC", dark: "#272236" } },
  GAMES: { accent: "#E87D6C", cardBg: { light: "#FDF2F0", dark: "#332220" } },
  FAMILY: { accent: "#E8A84C", cardBg: { light: "#FDF7ED", dark: "#31271B" } },
  FOOD: { accent: "#6CB8E8", cardBg: { light: "#F0F7FC", dark: "#1E2B35" } },
  SPORT: { accent: "#7DC98A", cardBg: { light: "#F2FAF4", dark: "#203024" } },
  ALL: { accent: "#A88AED", cardBg: { light: "#FAF8F0", dark: "#24221B" } },
};

interface Props {
  event: Happening & { distanceKm?: number; locationName?: string };
  darkMode: boolean;
  isSaved: boolean;
  onToggleSave: () => void;
  onPress: () => void;
  width?: number;
}

export default function EventCard({
  event,
  darkMode,
  isSaved,
  onToggleSave,
  onPress,
  width = 180, // Received dynamic width
}: Props) {
  const catKey = event.category ? String(event.category).toUpperCase() : "ALL";
  const theme = CATEGORY_COLORS[catKey] ?? CATEGORY_COLORS.ALL;

  const accentColor = theme.accent;
  // Use tinted card surface for background (or set accentColor if full solid accent is desired)
  const cardBg = darkMode ? theme.cardBg.dark : theme.cardBg.light;
  
  const textColor = darkMode ? "#FAF8F0" : "#24221B";
  const mutedColor = darkMode ? "#B8B6AC" : "#605E55";
  const borderColor = `${accentColor}40`; // 25% opacity border

  const formattedDate = event.dateTime?.toDate
    ? event.dateTime.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          backgroundColor: cardBg, // Tinted surface background
          borderColor: borderColor,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          overflow: "hidden"
        },
      ]}
    >
      {/* Decorative background accent circle */}
      <View
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: accentColor,
          opacity: 0.15,
          bottom: -20,
          right: -20,
        }}
      />

      {/* Image Header */}
      <View style={styles.imageContainer}>
        {event.thumbnail_url ? (
          <Image
            source={{ uri: event.thumbnail_url }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <ImageIcon size={24} color={mutedColor} />
        )}

        {/* Distance Badge */}
        {event.distanceKm !== undefined && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              {event.distanceKm.toFixed(1)} km away
            </Text>
          </View>
        )}

        {/* Save Bookmark */}
        <Pressable
          onPress={onToggleSave}
          style={styles.bookmarkButton}
        >
          <Bookmark size={13} color="#24221B" fill={isSaved ? "#24221B" : "none"} />
        </Pressable>
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        {/* Category Badge Pill */}
        <View style={{ flexDirection: "row", marginBottom: 6 }}>
          <View
            style={{
              backgroundColor: `${accentColor}25`,
              borderRadius: 20,
              paddingVertical: 3,
              paddingHorizontal: 8,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: accentColor,
                textTransform: "uppercase",
              }}
            >
              {event.category || "General"}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {event.title}
        </Text>

        {/* Location & Time details */}
        <View style={styles.metaRow}>
          <MapPin size={11} color={accentColor} />
          <Text style={[styles.metaText, { color: mutedColor }]} numberOfLines={1}>
            {event.locationName || "Nearby"}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Clock size={11} color={accentColor} />
          <Text style={[styles.metaText, { color: mutedColor }]} numberOfLines={1}>
            {formattedDate || "Date TBD"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,         // Default target width
    minWidth: 100,      // Never shrinks below 100
    maxWidth: 200,      // Never grows past 200
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: "hidden", // Required in RN to prevent transparent background bleed
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  imageContainer: {
    height: 110,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  distanceBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  distanceText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  bookmarkButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
});