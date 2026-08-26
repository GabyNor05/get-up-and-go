import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { happeningService } from "@get-up-and-go/firebase/src/services/happeningService";
import { Happening } from "@get-up-and-go/firebase/src/types/happening";
import EventCard from "@/components/nearby/eventCard";
import type { SeeAllSection, HappeningWithDistance } from "../../app/(tabs)/nearby";

interface Props {
  darkMode: boolean;
  section: SeeAllSection;
  onBack: () => void;
  onSelectEvent?: (id: string) => void;
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
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [events, setEvents] = useState<HappeningWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";

  useEffect(() => {
    async function loadSectionEvents() {
      try {
        setLoading(true);
        const data = await happeningService.getUpcomingHappenings();
        const nowMs = Date.now();

        const processed: HappeningWithDistance[] = data.map((item) => {
          const eventTime = item.dateTime?.toMillis ? item.dateTime.toMillis() : 0;
          const isNow = Math.abs(eventTime - nowMs) <= 3 * 60 * 60 * 1000;
          return {
            ...item,
            distanceKm: 0,
            status: isNow ? "now" : "upcoming",
            trending: (item.attendees?.length || 0) > 5 || (item.rsvps?.length || 0) > 10,
          };
        });

        const filtered = processed.filter((h) =>
          section === "trending" ? h.trending : h.status === section
        );

        setEvents(filtered);
      } catch (err) {
        console.error("Failed to load section data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSectionEvents();
  }, [section]);

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
        {loading ? (
          <ActivityIndicator size="large" color="#A88AED" style={{ marginTop: 40 }} />
        ) : (
          <>
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
          </>
        )}
      </ScrollView>
    </View>
  );
}