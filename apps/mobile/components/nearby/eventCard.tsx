import { View, Text, Pressable, StyleSheet } from "react-native";
import { Bookmark, MapPin, Clock, Image as ImageIcon } from "lucide-react-native";
import { Image } from "expo-image";
import type { Happening } from "../../../../packages/firebase/src/types/happening";
import { useAppTheme } from "@/hooks/useAppTheme";
import { categoryColors, radius, shadows, type CategoryKey } from "../../../../packages/shared-ui/tokens";


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
  const { t } = useAppTheme();
  const catKey = (event.category ? String(event.category).toUpperCase() : "ALL") as CategoryKey;
  const accentColor = categoryColors[catKey] ?? categoryColors.ALL;

  const textColor = t.textPrimary;
  const mutedColor = t.textSecondary;

  const formattedDate = event.dateTime?.toDate
    ? event.dateTime.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    // Outer view carries the shadow; the inner card clips its corners.
    // (Android draws elevation shadows through a card with no background.)
    <View style={[styles.shadowWrap, shadows.card, { width, backgroundColor: t.bgSurface }]}>
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={event.title}
      style={[styles.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}
    >

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
        {/* Category chip: colour always paired with its label */}
        <View style={styles.chipRow}>
          <View style={[styles.chip, { backgroundColor: accentColor }]}>
            <Text style={styles.chipText}>
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
          <MapPin size={12} color={t.textBrand} />
          <Text style={[styles.metaText, { color: mutedColor }]} numberOfLines={1}>
            {event.locationName || "Nearby"}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Clock size={12} color={t.textBrand} />
          <Text style={[styles.metaText, { color: mutedColor }]} numberOfLines={1}>
            {formattedDate || "Date TBD"}
          </Text>
        </View>
      </View>
    </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    minWidth: 100,
    maxWidth: 220,
    flexShrink: 0,
    borderRadius: radius.lg,
    marginRight: 12,
    marginBottom: 6,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  chipRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  chip: {
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#24221B",
    textTransform: "uppercase",
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
    fontSize: 12,
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
    fontSize: 15,
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
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
});