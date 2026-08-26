import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { ChevronLeft, X, Check } from "lucide-react-native";
import { Circle } from "../../../components/circles/circles-data";

interface Props {
  darkMode: boolean;
  onBack: () => void;
  onCreate: (circle: Circle, inviteeUserIds: string[]) => void;
}

const THEMES = [
  { accent: "#A88AED", light: "#EDE8FF", dark: "#2A2340" },
  { accent: "#A6C261", light: "#E8F5D8", dark: "#1E2A18" },
  { accent: "#E8A84C", light: "#FFF3E0", dark: "#2A2018" },
  { accent: "#6CB8E8", light: "#E8F4FF", dark: "#182030" },
  { accent: "#E87D6C", light: "#FFE8E4", dark: "#2A1E1B" },
  { accent: "#B8A0E8", light: "#F1EBFF", dark: "#241E30" },
  { accent: "#7DC98A", light: "#E4F7E8", dark: "#182A1D" },
  { accent: "#E8C24C", light: "#FFF7E0", dark: "#2A2618" },
];

const EMOJIS = ["🌸", "⚡", "🏡", "🧘", "⛰️", "📚", "⚽", "🚴", "🎨", "🎮", "🍜", "🎵", "🌊", "🔥"];

function generateCircleId(name: string): string {
  const prefix = (name.replace(/[^a-zA-Z]/g, "").slice(0, 4) || "CIRC").toUpperCase();
  const num = String(Math.floor(Math.random() * 90) + 10);
  const suffix = Array.from({ length: 2 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)]).join("");
  return `${prefix}-${num}-${suffix}`;
}

export default function CreateNewCircleScreen({ darkMode, onBack, onCreate }: Props) {
  const [name, setName] = useState("");
  const [themeIndex, setThemeIndex] = useState(0);
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [maxCirclees, setMaxCirclees] = useState("20");
  const [userIdInput, setUserIdInput] = useState("");
  const [inviteeIds, setInviteeIds] = useState<string[]>([]);

  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = darkMode ? "#B8B6AC" : "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.1)" : "rgba(36,34,27,0.12)";
  const surface = darkMode ? "#24221B" : "#FFFFFF";

  const theme = THEMES[themeIndex];
  const canCreate = name.trim().length > 0;

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.length >= 4 || tags.includes(t)) return;
    setTags((list) => [...list, t]);
    setTagInput("");
  };
  const addInvitee = () => {
    const id = userIdInput.trim();
    if (!id || inviteeIds.includes(id)) return;
    setInviteeIds((list) => [...list, id]);
    setUserIdInput("");
  };

  const handleCreate = () => {
    if (!canCreate) return;
    const newCircle: Circle = {
      id: Date.now(),
      circleId: generateCircleId(name),
      name: name.trim(),
      emoji,
      accent: theme.accent,
      cardBg: { light: theme.light, dark: theme.dark },
      tags,
      lastActive: "Just now",
      goal: goal.trim() ? goal.trim() : null,
      goalPct: 0,
      gpsCaption: "",
      members: [], // starts empty — invitees join once they accept, see inviteeIds
    };
    onCreate(newCircle, inviteeIds);
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={onBack} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: surface, borderWidth: 1, borderColor: border, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
          <ChevronLeft size={17} color={text} />
        </Pressable>

        <Text style={{ fontFamily: "Fredoka-SemiBold", fontSize: 28, fontWeight: "700", color: text, textAlign: "center", marginBottom: 18 }}>
          New Circle
        </Text>

        {/* Live preview — matches the "normal" bento card exactly */}
        <View
          style={{
            backgroundColor: darkMode ? theme.dark : theme.light,
            borderRadius: 22,
            padding: 16,
            borderWidth: 1,
            borderColor: `${theme.accent}33`,
            marginBottom: 24,
            minHeight: 140,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${theme.accent}30`, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 18 }}>{emoji}</Text>
            </View>
            <View style={{ backgroundColor: `${theme.accent}25`, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 9 }}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: theme.accent }}>Just now</Text>
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontFamily: "Fredoka-SemiBold", fontSize: 16, fontWeight: "600", color: text }} numberOfLines={1}>
              {name.trim() || "Your circle name"}
            </Text>
            <Text style={{ fontSize: 12, color: muted, marginTop: 2 }}>1 member</Text>
          </View>
          {tags.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {tags.map((t) => (
                <View key={t} style={{ backgroundColor: `${theme.accent}22`, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: theme.accent }}>{t}</Text>
                </View>
              ))}
            </View>
          )}
          {goal.trim().length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 11, color: muted }} numberOfLines={1}>🎯 {goal}</Text>
              <View style={{ height: 5, backgroundColor: `${theme.accent}22`, borderRadius: 3, marginTop: 5, overflow: "hidden" }}>
                <View style={{ height: "100%", width: "0%", backgroundColor: theme.accent }} />
              </View>
            </View>
          )}
        </View>

        <Field label="Circle Name">
          <TextInput
            placeholder="e.g. Weekend Warriors"
            placeholderTextColor={muted}
            value={name}
            onChangeText={setName}
            style={{ backgroundColor: surface, borderWidth: 1.5, borderColor: border, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, fontSize: 14, color: text }}
          />
        </Field>

        <Field label="Icon">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {EMOJIS.map((e) => {
              const selected = emoji === e;
              return (
                <Pressable
                  key={e}
                  onPress={() => setEmoji(e)}
                  style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: selected ? theme.accent : surface, borderWidth: selected ? 0 : 1, borderColor: border }}
                >
                  <Text style={{ fontSize: 18 }}>{e}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Field>

        <Field label="Color">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {THEMES.map((th, i) => {
              const selected = i === themeIndex;
              return (
                <Pressable
                  key={th.accent}
                  onPress={() => setThemeIndex(i)}
                  style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: th.accent, alignItems: "center", justifyContent: "center", borderWidth: selected ? 3 : 0, borderColor: bg }}
                >
                  {selected && <Check size={16} color="#fff" />}
                </Pressable>
              );
            })}
          </ScrollView>
        </Field>

        <Field label="Tags (up to 4)">
          <View style={{ flexDirection: "row", gap: 8, marginBottom: tags.length > 0 ? 10 : 0 }}>
            <TextInput
              placeholder="e.g. Hiking"
              placeholderTextColor={muted}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              editable={tags.length < 4}
              style={{ flex: 1, backgroundColor: surface, borderWidth: 1.5, borderColor: border, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, fontSize: 14, color: text }}
            />
            <Pressable
              disabled={!tagInput.trim() || tags.length >= 4}
              onPress={addTag}
              style={{ backgroundColor: tagInput.trim() && tags.length < 4 ? theme.accent : border, borderRadius: 12, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: tagInput.trim() && tags.length < 4 ? "#fff" : muted, fontSize: 13, fontWeight: "700" }}>Add</Text>
            </Pressable>
          </View>
          {tags.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {tags.map((t) => (
                <Pressable key={t} onPress={() => setTags((list) => list.filter((x) => x !== t))} style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: `${theme.accent}22`, borderRadius: 20, paddingVertical: 5, paddingHorizontal: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: theme.accent }}>{t}</Text>
                  <X size={11} color={theme.accent} />
                </Pressable>
              ))}
            </View>
          )}
        </Field>

        <Field label="Goal (optional)">
          <TextInput
            placeholder="e.g. 10 km from Moonlit trailhead"
            placeholderTextColor={muted}
            value={goal}
            onChangeText={setGoal}
            style={{ backgroundColor: surface, borderWidth: 1.5, borderColor: border, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, fontSize: 14, color: text, marginBottom: 6 }}
          />
          <Text style={{ fontSize: 11.5, color: muted }}>Progress starts at 0% — the circle updates it as everyone logs activity.</Text>
        </Field>

        <Field label="Max Circlees">
          <TextInput
            placeholder="20"
            placeholderTextColor={muted}
            value={maxCirclees}
            onChangeText={setMaxCirclees}
            keyboardType="number-pad"
            style={{ backgroundColor: surface, borderWidth: 1.5, borderColor: border, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, fontSize: 14, color: text, width: 120 }}
          />
        </Field>

        <Field label="Add Circlees by User ID">
          <View style={{ flexDirection: "row", gap: 8, marginBottom: inviteeIds.length > 0 ? 10 : 0 }}>
            <TextInput
              placeholder="e.g. ZDUX-08-DP"
              placeholderTextColor={muted}
              value={userIdInput}
              onChangeText={setUserIdInput}
              onSubmitEditing={addInvitee}
              autoCapitalize="characters"
              style={{ flex: 1, backgroundColor: surface, borderWidth: 1.5, borderColor: border, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, fontSize: 14, color: text }}
            />
            <Pressable
              disabled={!userIdInput.trim()}
              onPress={addInvitee}
              style={{ backgroundColor: userIdInput.trim() ? "#352C53" : border, borderRadius: 12, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: userIdInput.trim() ? "#fff" : muted, fontSize: 13, fontWeight: "700" }}>Add</Text>
            </Pressable>
          </View>
          {inviteeIds.length > 0 && (
            <View style={{ gap: 8 }}>
              {inviteeIds.map((id) => (
                <View key={id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: text }}>{id}</Text>
                  <Pressable onPress={() => setInviteeIds((list) => list.filter((x) => x !== id))}>
                    <X size={15} color={muted} />
                  </Pressable>
                </View>
              ))}
              <Text style={{ fontSize: 11.5, color: muted }}>
                {inviteeIds.length} circlee{inviteeIds.length > 1 ? "s" : ""} will be invited once the circle is created.
              </Text>
            </View>
          )}
        </Field>

        <Pressable
          disabled={!canCreate}
          onPress={handleCreate}
          style={{
            backgroundColor: canCreate ? theme.accent : border,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 6,
            marginBottom: 16,
            shadowColor: theme.accent,
            shadowOpacity: canCreate ? 0.4 : 0,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
            elevation: canCreate ? 4 : 0,
          }}
        >
          <Text style={{ color: canCreate ? "#FAF8F0" : muted, fontSize: 15, fontWeight: "700" }}>Create New Circle</Text>
        </Pressable>

        <Pressable onPress={onBack} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 }}>
          <ChevronLeft size={16} color={muted} />
          <Text style={{ fontSize: 14, color: muted, fontWeight: "600" }}>Back</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", opacity: 0.75, marginBottom: 8 }}>{label}</Text>
      {children}
    </View>
  );
}