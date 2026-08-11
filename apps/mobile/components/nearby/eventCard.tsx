import { View, Text, Pressable } from "react-native";
import { Bookmark, MapPin, Clock, Image as ImageIcon } from "lucide-react-native";
import type { Happening } from "../../data/happenings-data";

interface Props {
  event: Happening;
  darkMode: boolean;
  isSaved: boolean;
  onToggleSave: () => void;
  onPress: () => void;
}

export default function EventCard({ event, darkMode, isSaved, onToggleSave, onPress }: Props) {
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";
  const placeholderBg = darkMode ? "#3a382c" : "#dcdcdc";

  return (
    <View style={{ width: "47%", backgroundColor: surface, borderRadius: 16, borderWidth: 1, borderColor: border, overflow: "hidden" }}>
      <View style={{ height: 100, backgroundColor: placeholderBg, alignItems: "center", justifyContent: "center" }}>
        <ImageIcon size={26} color={muted} />
        <View style={{ position: "absolute", bottom: 8, left: 8, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 6, paddingVertical: 2, paddingHorizontal: 7 }}>
          <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>{event.distanceKm}km away</Text>
        </View>
        <Pressable
          onPress={onToggleSave}
          style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" }}
        >
          <Bookmark size={13} color="#24221B" fill={isSaved ? "#24221B" : "none"} />
        </Pressable>
      </View>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: text, marginBottom: 5 }} numberOfLines={1}>{event.title}</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 4, marginBottom: 3 }}>
          <MapPin size={11} color={muted} style={{ marginTop: 1 }} />
          <Text style={{ fontSize: 10.5, color: muted, flex: 1 }} numberOfLines={1}>{event.location}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 }}>
          <Clock size={11} color={muted} />
          <Text style={{ fontSize: 10.5, color: muted }}>{event.date}</Text>
        </View>
        <Pressable onPress={onPress} style={{ backgroundColor: border, borderRadius: 10, paddingVertical: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: text }}>View</Text>
        </Pressable>
      </View>
    </View>
  );
}
