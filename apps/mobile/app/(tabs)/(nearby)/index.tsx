import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import {
  Search,
  Plus,
  Minus,
  Leaf,
  Music,
  Gamepad2,
  Users,
  UtensilsCrossed,
  Dumbbell,
} from "lucide-react-native";
import { HAPPENINGS, Happening } from "../../../data/happenings-data";
import EventCard from "../../../components/nearby/eventCard";
import SeeAllScreen from "./SeeAllScreen";
import HappeningDetailDrawer from "./HappeningDetailDrawer";

export type SeeAllSection = "now" | "upcoming" | "trending";

interface Props {
  darkMode?: boolean;
  onSelectEvent?: (id: number) => void;
  onSeeAll?: (section: SeeAllSection) => void;
}

const CATEGORIES: { key: string; icon: any }[] = [
  { key: "Nature", icon: Leaf },
  { key: "Music", icon: Music },
  { key: "Games", icon: Gamepad2 },
  { key: "Family", icon: Users },
  { key: "Food", icon: UtensilsCrossed },
  { key: "Sport", icon: Dumbbell },
];

const ROW_LIMIT = 4;

export default function NearbyScreen({
  darkMode = false,
  onSelectEvent,
  onSeeAll,
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Nature");
  const [radiusKm, setRadiusKm] = useState(12);
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [seeAllSection, setSeeAllSection] = useState<SeeAllSection | null>(
    null,
  );

  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";

  const filteredBase = HAPPENINGS.filter(
    (h) =>
      h.category === category &&
      h.distanceKm <= radiusKm &&
      h.title.toLowerCase().includes(search.toLowerCase()),
  );
  const now = filteredBase.filter((h) => h.status === "now");
  const upcoming = filteredBase.filter((h) => h.status === "upcoming");
  const trending = filteredBase.filter((h) => h.trending);
  const noResults =
    now.length === 0 && upcoming.length === 0 && trending.length === 0;

  const handleSelectEvent = (id: number) => {
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
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <Text
            style={{
              fontFamily: "Fredoka-SemiBold",
              fontSize: 26,
              fontWeight: "600",
              color: text,
              marginBottom: 14,
            }}
          >
            Happening Near by
          </Text>

          {/* Search + radius row */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: surface,
                borderWidth: 1.5,
                borderColor: border,
                borderRadius: 14,
                paddingHorizontal: 14,
              }}
            >
              <TextInput
                placeholder="Search name or area"
                placeholderTextColor={muted}
                value={search}
                onChangeText={setSearch}
                style={{
                  flex: 1,
                  paddingVertical: 11,
                  fontSize: 14,
                  color: text,
                }}
              />
              <Search size={17} color={muted} />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: surface,
                borderWidth: 1.5,
                borderColor: border,
                borderRadius: 14,
                paddingHorizontal: 10,
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 13.5, fontWeight: "700", color: text }}>
                {radiusKm}km
              </Text>
              <Pressable
                onPress={() => setRadiusKm((r) => Math.min(15, r + 1))}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#A88AED",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={13} color="#FAF8F0" />
              </Pressable>
              <Pressable
                onPress={() => setRadiusKm((r) => Math.max(1, r - 1))}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Minus size={13} color={text} />
              </Pressable>
            </View>
          </View>

          {/* Category avatars */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 18, paddingBottom: 4 }}
          >
            {CATEGORIES.map((c) => {
              const isActive = category === c.key;
              const Icon = c.icon;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={{ alignItems: "center", gap: 6 }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isActive ? "#605E55" : surface,
                      borderWidth: isActive ? 0 : 1,
                      borderColor: border,
                    }}
                  >
                    <Icon size={20} color={isActive ? "#FAF8F0" : muted} />
                  </View>
                  <Text
                    style={{
                      fontSize: 11.5,
                      color: muted,
                      fontWeight: isActive ? "700" : "400",
                    }}
                  >
                    {c.key}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

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

        {noResults && (
          <Text
            style={{
              textAlign: "center",
              color: muted,
              fontSize: 13,
              marginTop: 30,
            }}
          >
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
  events: Happening[];
  darkMode: boolean;
  saved: Record<number, boolean>;
  setSaved: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  onSelectEvent?: (id: number) => void;
  onSeeAll?: (section: SeeAllSection) => void;
}) {
  const text = darkMode ? "#FAF8F0" : "#24221B";
  if (events.length === 0) return null;
  const visible = events.slice(0, ROW_LIMIT);

  return (
    <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: "Fredoka-SemiBold",
            fontSize: 19,
            fontWeight: "700",
            color: text,
          }}
        >
          {title}
        </Text>
        {/* "See All" always opens the full, unfiltered row for this section — not just the ones matching the current category/search */}
        <Pressable onPress={() => onSeeAll?.(section)}>
          <Text style={{ fontSize: 12.5, color: "#A88AED", fontWeight: "600" }}>
            See All
          </Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
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
      </View>
    </View>
  );
}
