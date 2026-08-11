import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ArrowLeft, Trophy, Sparkles } from "lucide-react-native";
import { CircleFeedItem, CircleItem, CircleMember } from "./circle-data";

interface Props {
  circle: CircleItem;
  darkMode: boolean;
  onBack: () => void;
  onViewProfile: (member: CircleMember) => void;
}

export default function CircleFeedView({
  circle,
  darkMode,
  onBack,
  onViewProfile,
}: Props) {
  const [meToos, setMeToos] = useState<Record<number, boolean>>({});

  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = darkMode ? "#B8B6AC" : "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";

  const ranked = useMemo(
    () =>
      [...circle.memberProfiles].sort(
        (a, b) => (a.rank ?? 99) - (b.rank ?? 99),
      ),
    [circle.memberProfiles],
  );
  const podium = [ranked[1], ranked[0], ranked[2]];

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Pressable
            onPress={onBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
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
              fontSize: 24,
              fontWeight: "700",
              color: text,
            }}
          >
            {circle.name}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: text }}>
              Leaderboard
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Trophy size={14} color={circle.accent} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: circle.accent,
                }}
              >
                Fresh this week
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {podium.map((member, podiumPos) => {
              if (!member) return <View key={podiumPos} style={{ flex: 1 }} />;
              const isFirst = podiumPos === 1;
              const size = isFirst ? 100 : 84;
              return (
                <Pressable
                  key={member.id}
                  onPress={() => onViewProfile(member)}
                  style={{ flex: 1, alignItems: "center" }}
                >
                  <View
                    style={{
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      backgroundColor: member.color,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 3,
                      borderColor: surface,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "700",
                        color: "#FAF8F0",
                      }}
                    >
                      {member.initial}
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 12, fontWeight: "700", color: text }}
                  >
                    {member.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: muted }}>
                    {member.km} km
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: text }}>
              Recent Activity
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Sparkles size={14} color={circle.accent} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: circle.accent,
                }}
              >
                Live
              </Text>
            </View>
          </View>

          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: border,
              backgroundColor: surface,
              overflow: "hidden",
            }}
          >
            {circle.feed.map((item, index) => (
              <View
                key={`${item.actor}-${index}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  borderBottomWidth: index < circle.feed.length - 1 ? 1 : 0,
                  borderBottomColor: border,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: `${circle.accent}20`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{circle.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 13, fontWeight: "700", color: text }}
                  >
                    {item.actor}
                  </Text>
                  <Text style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                    {item.action}
                  </Text>
                </View>
                {item.meToo !== undefined && (
                  <Pressable
                    onPress={() =>
                      setMeToos((prev) => ({ ...prev, [index]: !prev[index] }))
                    }
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: meToos[index]
                        ? `${circle.accent}20`
                        : `${circle.accent}10`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: circle.accent,
                      }}
                    >
                      {meToos[index] ? "Me too" : "Me too"}
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
