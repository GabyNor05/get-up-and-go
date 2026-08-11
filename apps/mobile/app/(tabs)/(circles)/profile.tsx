import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  ArrowLeft,
  Crown,
  MessageCircleMore,
  Users,
} from "lucide-react-native";
import { circles, CircleMember } from "./circle-data";

export default function CircleProfileRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    circleName?: string;
    memberId?: string;
  }>();

  const circle =
    circles.find((item) => item.name === params.circleName) ?? circles[0];
  const member = circle.memberProfiles.find(
    (profile) =>
      profile.userId === params.memberId ||
      profile.id.toString() === params.memberId,
  );

  const bg = "#F4F0DD";
  const surface = "#FAF8F0";
  const text = "#24221B";
  const muted = "#605E55";
  const border = "rgba(36,34,27,0.08)";

  if (!member) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: bg,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: text }}>
          Profile not found
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
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
            onPress={() => router.back()}
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
            {member.name}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <View
            style={{
              backgroundColor: surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: border,
              padding: 18,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  backgroundColor: member.color,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 30, fontWeight: "700", color: "#FAF8F0" }}
                >
                  {member.initial}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: text }}>
                  {member.name}
                </Text>
                <Text style={{ fontSize: 12, color: muted, marginTop: 4 }}>
                  {member.email}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: member.color,
                    marginTop: 6,
                    fontWeight: "700",
                  }}
                >
                  @{member.userId.replace("@", "")}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 16, flexDirection: "row", gap: 10 }}>
              <View
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: `${member.color}15`,
                }}
              >
                <Text style={{ fontSize: 11, color: muted }}>Distance</Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: text,
                    marginTop: 2,
                  }}
                >
                  {member.km} km
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: `${member.color}15`,
                }}
              >
                <Text style={{ fontSize: 11, color: muted }}>Level</Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: text,
                    marginTop: 2,
                  }}
                >
                  Lv {member.level}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              marginTop: 14,
              backgroundColor: surface,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: border,
              padding: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Crown size={14} color={member.color} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: muted }}>
                Circle standing
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: text,
                marginTop: 6,
              }}
            >
              #{member.rank ?? "—"} in {circle.name}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
              }}
            >
              <Users size={14} color={member.color} />
              <Text style={{ fontSize: 13, color: muted }}>
                {member.circles} circles joined
              </Text>
            </View>
          </View>

          <Pressable
            style={{
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 12,
            }}
          >
            <MessageCircleMore size={14} color={member.color} />
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: member.color }}
            >
              Send a nudge
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
