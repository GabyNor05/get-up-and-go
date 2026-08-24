import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { CIRCLES, CircleMember } from "../circles-data";
import { router } from "expo-router";

interface Props {
  darkMode: boolean;
  circleId: number;

}

export default function CircleFeedScreen({ darkMode, circleId }: Props) {
  const circle = CIRCLES.find((c) => c.id === circleId) ?? CIRCLES[0];
  const [meToo, setMeToo] = useState(false);

  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = darkMode ? "#B8B6AC" : "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";

  const ranked = [...circle.members].sort((a, b) => b.gpScore - a.gpScore).slice(0, 3);
  const podiumOrder = [ranked[1], ranked[0], ranked[2]].filter(Boolean) as CircleMember[]; // 2nd, 1st, 3rd left-to-right

  const feedActor = circle.members[circle.members.length - 1];
  const feedPair = circle.members.length >= 2 ? [circle.members[0], circle.members[1]] : null;

  function onBack(){
    router.navigate("../(circles)");
  }

  function onManageCirclees(){
    /* Opens the manage circles drawer */
    router.push(`/manageCircleesDrawer`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, paddingTop: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={onBack} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: surface, borderWidth: 1, borderColor: border, alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={17} color={text} />
          </Pressable>
        </View>

        <Text style={{ fontFamily: "Fredoka-SemiBold", fontSize: 30, fontWeight: "700", color: text, textAlign: "center", marginTop: 4, marginBottom: 22 }}>
          {circle.name}
        </Text>

        {/* Leaderboard podium */}
        {ranked.length > 0 && (
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "flex-end", gap: 14, paddingHorizontal: 24, marginBottom: 26 }}>
            {podiumOrder.map((m) => {
              const place = m === ranked[0] ? 1 : m === ranked[1] ? 2 : 3;
              const isFirst = place === 1;
              return (
                <View key={m.userId} style={{ alignItems: "center" }}>
                  <View style={{ width: isFirst ? 56 : 48, height: isFirst ? 56 : 48, borderRadius: isFirst ? 28 : 24, backgroundColor: circle.accent, alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                    <Text style={{ color: "#FAF8F0", fontWeight: "700", fontSize: isFirst ? 20 : 16 }}>{m.name[0]}</Text>
                  </View>
                  <Text style={{ fontSize: 12.5, fontWeight: "700", color: text, marginBottom: 6 }} numberOfLines={1}>{m.name}</Text>
                  <View
                    style={{
                      width: isFirst ? 64 : 56,
                      height: isFirst ? 60 : 42,
                      borderRadius: 10,
                      backgroundColor: isFirst ? "#3a3730" : darkMode ? "#3a382c" : "#e0ddd2",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: isFirst ? 20 : 15, fontWeight: "800", color: isFirst ? "#fff" : text }}>
                      {place}
                      <Text style={{ fontSize: 10 }}>{place === 1 ? "st" : place === 2 ? "nd" : "rd"}</Text>
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* WWD feed */}
        <View style={{ paddingHorizontal: 18, gap: 10 }}>
          {feedActor && (
            <View style={{ backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${circle.accent}30`, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: circle.accent }}>{feedActor.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: "700", color: text }}>{feedActor.name}</Text>
                  <Text style={{ fontSize: 12, color: muted }}>Going to a {circle.tags[0]} spot today</Text>
                </View>
              </View>
              <Pressable
                onPress={() => setMeToo((v) => !v)}
                style={{ backgroundColor: meToo ? circle.accent : border, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12 }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: meToo ? "#FAF8F0" : text }}>{meToo ? "Me Too ✓" : "Me Too"}</Text>
              </Pressable>
            </View>
          )}
          {feedPair && (
            <View style={{ backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 16, padding: 14 }}>
              <Text style={{ fontSize: 13.5, fontWeight: "700", color: text }}>
                {feedPair[0].name} and {feedPair[1].name}
              </Text>
              <Text style={{ fontSize: 12, color: muted, marginTop: 2 }}>Went to a {circle.name} meetup</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={{ padding: 18, paddingTop: 10 }}>
        <Pressable onPress={onManageCirclees} >
            
          <Text style={{ color: "#FAF8F0", fontSize: 14, fontWeight: "700" }}>Manage Circlees</Text>
        </Pressable>
      </View>
    </View>
  );
}