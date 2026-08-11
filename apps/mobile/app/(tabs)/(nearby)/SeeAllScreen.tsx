import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { HAPPENINGS } from "../../../data/happenings-data";
import EventCard from "../../../components/nearby/eventCard";
import type { SeeAllSection } from "./index";

interface Props {
  darkMode: boolean;
  section: SeeAllSection;
  onBack: () => void;
  onSelectEvent?: (id: number) => void;
}

const SECTION_TITLES: Record<SeeAllSection, string> = {
  now: "Happening Now",
  trending: "Trending",
  upcoming: "Upcoming",
};

export default function SeeAllScreen({
  darkMode,
  section,
  onBack,
  onSelectEvent,
}: Props) {
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";

  // Deliberately unfiltered by category/radius/search — this is the full row.
  const events = HAPPENINGS.filter((h) =>
    section === "trending" ? h.trending : h.status === section,
  );

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 6,
        }}
      >
        <Pressable
          onPress={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: surface,
            borderWidth: 1,
            borderColor: border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={18} color={text} />
        </Pressable>
        <Text
          style={{
            fontFamily: "Fredoka-SemiBold",
            fontSize: 20,
            fontWeight: "700",
            color: text,
          }}
        >
          {SECTION_TITLES[section]}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {events.map((e) => (
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
        {events.length === 0 && (
          <Text
            style={{
              textAlign: "center",
              color: muted,
              fontSize: 13,
              marginTop: 30,
            }}
          >
            Nothing here yet.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
