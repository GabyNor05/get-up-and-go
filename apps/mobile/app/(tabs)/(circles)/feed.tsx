import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import CircleFeedView from "./CircleFeedView";
import CircleMemberDrawer from "./CircleMemberDrawer";
import { circles, CircleMember } from "./circle-data";

export default function CircleFeedRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ circleName?: string }>();
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(
    null,
  );

  const circle = useMemo(
    () => circles.find((item) => item.name === params.circleName) ?? circles[0],
    [params.circleName],
  );

  return (
    <>
      <CircleFeedView
        circle={circle}
        darkMode={false}
        onBack={() => router.back()}
        onViewProfile={(member) => setSelectedMember(member)}
      />
      <CircleMemberDrawer
        member={selectedMember}
        darkMode={false}
        onClose={() => setSelectedMember(null)}
        onViewProfile={(member) => {
          setSelectedMember(member);
          router.push({
            pathname: "/(tabs)/(circles)/profile",
            params: { circleName: circle.name, memberId: member.userId },
          });
        }}
      />
    </>
  );
}
