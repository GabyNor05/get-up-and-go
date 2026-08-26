import { View, Text, Pressable, ScrollView } from "react-native";
import {router} from "expo-router";
import { Link2, Plus } from "lucide-react-native";
import { CIRCLES, Circle, CircleMember } from "../../../components/circles/circles-data";
import { Header } from "@/components/textFormating";

/* D:\Repos\get-up-and-go\packages\shared-ui\shared-ui.css */
interface Props {
  darkMode: boolean;  
}

const AVATAR_COLORS = ["#A88AED", "#A6C261", "#E8A84C", "#6CB8E8", "#E87D6C", "#B8A0E8", "#7DC98A"];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function onSelectCircle(id: number){
  router.push(`./${id}`);
}

function onNewCircle(){
  router.push("./newCircleForm");
}

function onJoinCircle(){

}

export default function CirclesScreen({ darkMode}: Props) {
  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = darkMode ? "#B8B6AC" : "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";
  const surface = darkMode ? "#24221B" : "#FAF8F0";

  const groups = chunk(CIRCLES, 4);

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Header — no top-right button here, see note below */}
        <View style={{ marginBottom: 20 }}>
          <Header pageHeader="Welcome back!" subHeading={CIRCLES.length.toString() + " active groups"} />

        </View>

        {/* Bento grid — repeats the tall / normal+normal / wide pattern every 4 circles */}
        {groups.map((group, gi) => (
          <View key={gi} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              {group[0] && (
                <View style={{ flex: 1 }}>
                  <BentoCard circle={group[0]} darkMode={darkMode} variant="tall" onPress={() => onSelectCircle(group[0].id)} />
                </View>
              )}
              {(group[1] || group[2]) && (
                <View style={{ flex: 1, gap: 12 }}>
                  {group[1] && <BentoCard circle={group[1]} darkMode={darkMode} variant="normal" onPress={() => onSelectCircle(group[1].id)} />}
                  {group[2] && <BentoCard circle={group[2]} darkMode={darkMode} variant="normal" onPress={() => onSelectCircle(group[2].id)} />}
                </View>
              )}
            </View>
            {group[3] && <BentoCard circle={group[3]} darkMode={darkMode} variant="wide" onPress={() => onSelectCircle(group[3].id)} />}
          </View>
        ))}
      </ScrollView>

      {/* Bottom action bar — thumb zone.
          FigmaMake put "+ New" top-right and a dashed "Find & Join a Circle" tile
          inline in the grid. Both sit in the hardest-to-reach part of the screen for
          one-handed use, and the dashed tile duplicates what a bottom "Join Circle"
          button already does. Your own wireframes already solved this by anchoring
          Join/New Circle to the bottom, so that's what this keeps. */}
      <View style={{ flexDirection: "row", gap: 10, padding: 18, paddingTop: 12, backgroundColor: bg, borderTopWidth: 1, borderTopColor: border }}>
        <Pressable
          onPress={onJoinCircle}
          style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: surface, borderWidth: 1.5, borderColor: border, borderRadius: 14, paddingVertical: 13 }}
        >
          <Link2 size={16} color={text} />
          <Text style={{ fontSize: 14, fontWeight: "700", color: text }}>Join Circle</Text>
        </Pressable>
        <Pressable
          onPress={onNewCircle}
          style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#A88AED", borderRadius: 14, paddingVertical: 13, shadowColor: "#A88AED", shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
        >
          <Plus size={16} color="#FAF8F0" />
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#FAF8F0" }}>New Circle</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BentoCard({
  circle,
  darkMode,
  variant,
  onPress,
}: {
  circle: Circle;
  darkMode: boolean;
  variant: "tall" | "normal" | "wide";
  onPress: () => void;
}) {
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = darkMode ? "#B8B6AC" : "#605E55";
  const cardBg = darkMode ? circle.cardBg.dark : circle.cardBg.light;
  const memberCount = circle.members.length + 1; // +1 for "You"
  const wide = variant === "wide";
  const tall = variant === "tall";

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: cardBg,
        borderRadius: 22,
        padding: wide ? 18 : 16,
        borderWidth: 1,
        borderColor: `${circle.accent}33`,
        overflow: "hidden",
        minHeight: tall ? 292 : wide ? undefined : 140,
        flexDirection: wide ? "row" : "column",
        justifyContent: "space-between",
        gap: wide ? 16 : 0,
      }}
    >
      {/* Decorative accent circle */}
      <View
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: circle.accent,
          opacity: 0.08,
          bottom: wide ? undefined : -20,
          right: -20,
          top: wide ? -20 : undefined,
        }}
      />

      <View style={{ flex: 1, gap: wide ? 4 : 8 }}>
        {/* Top row: emoji badge + last active */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${circle.accent}30`, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 18 }}>{circle.emoji}</Text>
          </View>
          <View style={{ backgroundColor: `${circle.accent}25`, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 9 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: circle.accent }}>{circle.lastActive}</Text>
          </View>
        </View>

        {/* Name + member count */}
        <View>
          <Text style={{ fontFamily: "Fredoka-SemiBold", fontSize: tall ? 20 : wide ? 18 : 16, fontWeight: "600", color: text }}>
            {circle.name}
          </Text>
          <Text style={{ fontSize: 12, color: muted, marginTop: 2 }}>{memberCount} members</Text>
        </View>

        {/* Tags */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {circle.tags.map((tag) => (
            <View key={tag} style={{ backgroundColor: `${circle.accent}22`, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: circle.accent }}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Goal progress — tall and wide cards only, matches FigmaMake */}
        {circle.goal && (tall || wide) && (
          <View style={{ marginTop: tall ? "auto" : 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
              <Text style={{ fontSize: 11, color: muted, flex: 1, marginRight: 8 }} numberOfLines={1}>🎯 {circle.goal}</Text>
              <Text style={{ fontSize: 11, fontWeight: "700", color: circle.accent }}>{circle.goalPct}%</Text>
            </View>
            <View style={{ height: 5, backgroundColor: `${circle.accent}22`, borderRadius: 3, overflow: "hidden" }}>
              <View style={{ height: "100%", width: `${circle.goalPct}%`, backgroundColor: circle.accent, borderRadius: 3 }} />
            </View>
          </View>
        )}
      </View>

      {/* Avatars + View button */}
      <View
        style={
          wide
            ? { alignItems: "flex-end", justifyContent: "space-between", gap: 12 }
            : { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: tall ? 12 : "auto", paddingTop: tall ? 0 : 10 }
        }
      >
        <AvatarStack members={circle.members} accent={circle.accent} surface={cardBg} total={memberCount} />
        <Pressable
          onPress={onPress}
          style={{ backgroundColor: circle.accent, borderRadius: wide ? 12 : 10, paddingVertical: wide ? 8 : 6, paddingHorizontal: wide ? 16 : 13 }}
        >
          <Text style={{ fontSize: wide ? 12 : 11, fontWeight: "700", color: "#FAF8F0" }}>View →</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function AvatarStack({ members, accent, surface, total }: { members: CircleMember[]; accent: string; surface: string; total: number }) {
  const show = members.slice(0, 3);
  const extra = total - show.length;
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {show.map((m, i) => (
        <View
          key={m.userId}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
            borderWidth: 2,
            borderColor: surface,
            marginLeft: i > 0 ? -8 : 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#FAF8F0" }}>{m.name[0]}</Text>
        </View>
      ))}
      {extra > 0 && (
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: `${accent}30`, borderWidth: 2, borderColor: surface, marginLeft: -8, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 9, fontWeight: "700", color: accent }}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}