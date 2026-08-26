import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import {
  Search,
  Plus,
  Minus,
  Leaf,
  Music,
  Gamepad2,
  Users,
  UtensilsCrossed,
  GalleryVerticalEnd,
  Dumbbell,
} from "lucide-react-native";
import * as Location from "expo-location";
import { happeningService } from "../../../../packages/firebase/src/services/happeningService";
import { Happening, HappeningCategory } from "../../../../packages/firebase/src/types/happening";
import EventCard from "@/components/nearby/eventCard";
import SeeAllScreen from "../../components/nearby/SeeAllScreen";
import HappeningDetailDrawer from "../../components/nearby/HappeningDetailDrawer";
import { injectPretoriaHappenings } from "@/scripts/seedHappenings";

export type SeeAllSection = "now" | "upcoming" | "trending";
export type CategoryFilter = HappeningCategory | "ALL";

export interface HappeningWithDistance extends Happening {
  distanceKm: number;
  status: "now" | "upcoming";
  trending: boolean;
}

interface Props {
  darkMode?: boolean;
  onSelectEvent?: (id: string) => void;
  onSeeAll?: (section: SeeAllSection) => void;
}

const CATEGORIES: { key: CategoryFilter; label: string; icon: any }[] = [
  { key: "ALL", label: "All", icon: GalleryVerticalEnd },
  { key: "NATURE", label: "Nature", icon: Leaf },
  { key: "MUSIC", label: "Music", icon: Music },
  { key: "GAMES", label: "Games", icon: Gamepad2 },
  { key: "FAMILY", label: "Family", icon: Users },
  { key: "FOOD", label: "Food", icon: UtensilsCrossed },
  { key: "SPORT", label: "Sport", icon: Dumbbell },
];

const ROW_LIMIT = 4;

/**
 * Calculates distance between two coordinates in Kilometers (Haversine formula)
 */
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function NearbyScreen({
  darkMode = false,
  onSelectEvent,
  onSeeAll,
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [radiusKm, setRadiusKm] = useState(10); // Increased default radius so all 7 venues display
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [seeAllSection, setSeeAllSection] = useState<SeeAllSection | null>(null);

  const [happenings, setHappenings] = useState<HappeningWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";

  // Fetch location and Firestore data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
         /* injectPretoriaHappenings();  */ 
        // Get user location
        const { status } = await Location.requestForegroundPermissionsAsync();
        let userLat = 0;
        let userLon = 0;

        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          userLat = loc.coords.latitude;
          userLon = loc.coords.longitude;
          console.log("User Location:", { latitude: userLat, longitude: userLon });
        }

        // Fetch happenings from service
        const data = await happeningService.getUpcomingHappenings();
        const nowMs = Date.now();

        // Calculate distance and determine statuses dynamically
        const processed: HappeningWithDistance[] = data.map((item: any) => {
          // Support both item.location and item.coordinates schema
          const targetLat = item.location?.latitude ?? item.coordinates?.latitude;
          const targetLon = item.location?.longitude ?? item.coordinates?.longitude;

          const dist = targetLat && targetLon
            ? getDistanceFromLatLonInKm(userLat, userLon, targetLat, targetLon)
            : 0;

          const eventTime = item.dateTime?.toMillis ? item.dateTime.toMillis() : 0;
          const isNow = Math.abs(eventTime - nowMs) <= 3 * 60 * 60 * 1000;

          return {
            ...item,
            distanceKm: Math.round(dist * 10) / 10,
            status: isNow ? "now" : "upcoming",
            trending: (item.attendees?.length || 0) > 5 || (item.rsvps?.length || 0) > 2,
          };
        });

        setHappenings(processed);
      } catch (err) {
        console.error("Failed to fetch happenings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Updated filter handles category === "ALL"
  const filteredBase = happenings.filter(
    (h) =>
      (category === "ALL" || h.category === category) &&
      h.distanceKm <= radiusKm &&
      h.title.toLowerCase().includes(search.toLowerCase())
  );

  const now = filteredBase.filter((h) => h.status === "now");
  const upcoming = filteredBase.filter((h) => h.status === "upcoming");
  const trending = filteredBase.filter((h) => h.trending);
  const noResults = !loading && now.length === 0 && upcoming.length === 0 && trending.length === 0;

  const handleSelectEvent = (id: string) => {
    onSelectEvent?.(id);
    setSelectedEventId(id);
  };

  const handleSeeAll = (section: SeeAllSection) => {
    onSeeAll?.(section);
    setSeeAllSection(section);
  };

  const handleCloseDetail = () => setSelectedEventId(null);
  const handleBackFromSeeAll = () => setSeeAllSection(null);

  if (seeAllSection) {
    return (
      <View style={{ flex: 1, backgroundColor: bg }}>
        <SeeAllScreen
          darkMode={darkMode}
          section={seeAllSection}
          onBack={handleBackFromSeeAll}
          onSelectEvent={handleSelectEvent}
        />
        <HappeningDetailDrawer
          darkMode={darkMode}
          eventId={selectedEventId}
          onClose={handleCloseDetail}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <Text style={{ fontFamily: "Fredoka-SemiBold", fontSize: 26, fontWeight: "600", color: text, marginBottom: 14 }}>
            Happening Nearby
          </Text>

          {/* Search + radius row */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: surface, borderWidth: 1.5, borderColor: border, borderRadius: 14, paddingHorizontal: 14 }}>
              <TextInput
                placeholder="Search name or area"
                placeholderTextColor={muted}
                value={search}
                onChangeText={setSearch}
                style={{ flex: 1, paddingVertical: 11, fontSize: 14, color: text }}
              />
              <Search size={17} color={muted} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: surface, borderWidth: 1.5, borderColor: border, borderRadius: 14, paddingHorizontal: 10, gap: 6 }}>
              <Text style={{ fontSize: 13.5, fontWeight: "700", color: text }}>
                {radiusKm}km
              </Text>
              <Pressable
                onPress={() => setRadiusKm((r) => Math.min(100, r + 5))}
                style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#A88AED", alignItems: "center", justifyContent: "center" }}
              >
                <Plus size={13} color="#FAF8F0" />
              </Pressable>
              <Pressable
                onPress={() => setRadiusKm((r) => Math.max(1, r - 5))}
                style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: border, alignItems: "center", justifyContent: "center" }}
              >
                <Minus size={13} color={text} />
              </Pressable>
            </View>
          </View>

          {/* Category selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = category === cat.key;

              return (
                <Pressable
                  key={cat.key}
                  onPress={() => setCategory(cat.key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isSelected ? "#A88AED" : surface,
                  }}
                >
                  <IconComponent size={16} color={isSelected ? "#FAF8F0" : text} />
                  <Text style={{ color: isSelected ? "#FAF8F0" : text, fontWeight: "600" }}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#A88AED" style={{ marginTop: 40 }} />
        ) : (
          <>
            <Row
              title="Happening Now"
              section="now"
              events={now}
              darkMode={darkMode}
              saved={saved}
              setSaved={setSaved}
              onSelectEvent={handleSelectEvent}
              onSeeAll={handleSeeAll}
            />
            <Row
              title="Trending"
              section="trending"
              events={trending}
              darkMode={darkMode}
              saved={saved}
              setSaved={setSaved}
              onSelectEvent={handleSelectEvent}
              onSeeAll={handleSeeAll}
            />
            <Row
              title="Upcoming"
              section="upcoming"
              events={upcoming}
              darkMode={darkMode}
              saved={saved}
              setSaved={setSaved}
              onSelectEvent={handleSelectEvent}
              onSeeAll={handleSeeAll}
            />
          </>
        )}

        {noResults && (
          <Text style={{ textAlign: "center", color: muted, fontSize: 13, marginTop: 30 }}>
            No happenings match your search.
          </Text>
        )}
      </ScrollView>

      <HappeningDetailDrawer
        darkMode={darkMode}
        eventId={selectedEventId}
        onClose={handleCloseDetail}
      />
    </View>
  );
}

function Row({
  title,
  section,
  events,
  darkMode,
  saved,
  setSaved,
  onSelectEvent,
  onSeeAll,
}: {
  title: string;
  section: SeeAllSection;
  events: HappeningWithDistance[];
  darkMode: boolean;
  saved: Record<string, boolean>;
  setSaved: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onSelectEvent?: (id: string) => void;
  onSeeAll?: (section: SeeAllSection) => void;
}) {
  const text = darkMode ? "#FAF8F0" : "#24221B";
  if (events.length === 0) return null;
  const visible = events.slice(0, ROW_LIMIT);

  return (
    <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <Text style={{ fontFamily: "Fredoka-SemiBold", fontSize: 19, fontWeight: "700", color: text }}>
          {title}
        </Text>
        <Pressable onPress={() => onSeeAll?.(section)}>
          <Text style={{ fontSize: 12.5, color: "#A88AED", fontWeight: "600" }}>
            See All
          </Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
        {visible.map((e) => (
          <EventCard
            key={e.id}
            event={e}
            darkMode={darkMode}
            isSaved={!!saved[e.id]}
            onToggleSave={() => setSaved((s) => ({ ...s, [e.id]: !s[e.id] }))}
            onPress={() => onSelectEvent?.(e.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}