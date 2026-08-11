import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Plus, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { avatarColors, circles, CircleItem } from "./circle-data";

interface Props {
  darkMode?: boolean;
}

export default function CirclesScreen({ darkMode = false }: Props) {
  const router = useRouter();
  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = darkMode ? "#B8B6AC" : "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Text
            style={{
              fontFamily: "Fredoka-SemiBold",
              fontSize: 28,
              fontWeight: "700",
              color: text,
            }}
          >
            My Circles
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: muted,
              marginTop: 4,
              marginBottom: 14,
            }}
          >
            {circles.length} active groups · choose one with one thumb
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {circles.map((circle) => {
              const isFullWidth =
                circle.size === "featured" || circle.size === "wide";
              return (
                <View
                  key={circle.name}
                  style={{ width: isFullWidth ? "100%" : "48%" }}
                >
                  <CircleCard
                    circle={circle}
                    darkMode={darkMode}
                    text={text}
                    muted={muted}
                    surface={surface}
                    border={border}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/(circles)/feed",
                        params: { circleName: circle.name },
                      })
                    }
                  />
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 20,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <Pressable
          style={{
            flex: 1,
            minHeight: 54,
            borderRadius: 18,
            backgroundColor: surface,
            borderWidth: 1.2,
            borderColor: border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Search size={17} color={muted} />
          <Text style={{ color: muted, fontSize: 14, fontWeight: "700" }}>
            Find a Circle
          </Text>
        </Pressable>
        <Pressable
          style={{
            flex: 1,
            minHeight: 54,
            borderRadius: 18,
            backgroundColor: "#A88AED",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            shadowColor: "#A88AED",
            shadowOpacity: 0.28,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Plus size={17} color="#FAF8F0" />
          <Text style={{ color: "#FAF8F0", fontSize: 14, fontWeight: "700" }}>
            New Circle
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function CircleCard({
  circle,
  darkMode,
  text,
  muted,
  surface,
  onPress,
}: {
  circle: CircleItem;
  darkMode: boolean;
  text: string;
  muted: string;
  surface: string;
  border: string;
  onPress: () => void;
}) {
  const cardBg = darkMode ? circle.cardBg.dark : circle.cardBg.light;
  const isFeatured = circle.size === "featured";
  const isWide = circle.size === "wide";

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: cardBg,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: `${circle.accent}22`,
        padding: isFeatured ? 16 : 14,
        minHeight: isFeatured ? 240 : isWide ? 180 : 170,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: 110,
          height: 110,
          borderRadius: 55,
          backgroundColor: `${circle.accent}14`,
          right: -20,
          bottom: -20,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: `${circle.accent}25`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18 }}>{circle.emoji}</Text>
        </View>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: `${circle.accent}16`,
          }}
        >
          <Text
            style={{ fontSize: 10, fontWeight: "700", color: circle.accent }}
          >
            {circle.lastActive}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 12 }}>
        <Text
          style={{
            fontFamily: "Fredoka-SemiBold",
            fontSize: isFeatured ? 20 : 17,
            fontWeight: "700",
            color: text,
          }}
        >
          {circle.name}
        </Text>
        <Text style={{ fontSize: 12, color: muted, marginTop: 3 }}>
          {circle.blurb}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 10,
        }}
      >
        {circle.tags.map((tag) => (
          <View
            key={tag}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: `${circle.accent}15`,
            }}
          >
            <Text
              style={{ fontSize: 10, fontWeight: "700", color: circle.accent }}
            >
              {tag}
            </Text>
          </View>
        ))}
      </View>

      {circle.goal && (
        <View style={{ marginTop: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <Text style={{ fontSize: 11, color: muted }}>{circle.goal}</Text>
            <Text
              style={{ fontSize: 11, fontWeight: "700", color: circle.accent }}
            >
              {circle.goalPct}%
            </Text>
          </View>
          <View
            style={{
              height: 5,
              borderRadius: 999,
              backgroundColor: `${circle.accent}22`,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${circle.goalPct}%`,
                backgroundColor: circle.accent,
                borderRadius: 999,
              }}
            />
          </View>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 14,
        }}
      >
        <AvatarStack
          avatars={circle.avatars}
          accent={circle.accent}
          surface={surface}
          total={circle.members}
        />
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: circle.accent,
          }}
        >
          <Text style={{ color: "#FAF8F0", fontSize: 12, fontWeight: "700" }}>
            View
          </Text>
        </View>
      </View>

      {circle.live && (
        <View
          style={{
            marginTop: 10,
            alignSelf: "flex-start",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: "rgba(166, 194, 97, 0.2)",
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#6D8F2D" }}>
            Live now
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function AvatarStack({
  avatars,
  accent,
  surface,
  total,
}: {
  avatars: string[];
  accent: string;
  surface: string;
  total: number;
}) {
  const show = avatars.slice(0, 4);
  const extra = total - show.length;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {show.map((avatar, index) => (
        <View
          key={`${avatar}-${index}`}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: avatarColors[index % avatarColors.length],
            borderWidth: 2,
            borderColor: surface,
            marginLeft: index > 0 ? -8 : 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#FAF8F0" }}>
            {avatar}
          </Text>
        </View>
      ))}
      {extra > 0 && (
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: `${accent}22`,
            borderWidth: 2,
            borderColor: surface,
            marginLeft: -8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 9, fontWeight: "700", color: accent }}>
            +{extra}
          </Text>
        </View>
      )}
    </View>
  );
}
