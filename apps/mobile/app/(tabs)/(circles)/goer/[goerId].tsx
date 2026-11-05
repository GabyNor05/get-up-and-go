import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Award, ChevronLeft, Share2, Star, Users } from 'lucide-react-native';

import { Avatar } from '@/components/ui/Avatar';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useGoer } from '@/hooks/useGoer';
import { useGoPoints } from '@/hooks/useGoPoints';
import { loadMember, type CircleMember } from '@/hooks/useCircles';
import { fonts, radius } from '../../../../../../packages/shared-ui/tokens';

/** A Circlee's public profile */
export default function GoerProfileScreen() {
  const router = useRouter();
  const { goerId: uid } = useLocalSearchParams<{ goerId: string }>();
  const { t } = useAppTheme();
  const { goerId: myUid } = useGoer();
  const gp = useGoPoints(uid ?? null);
  const [member, setMember] = useState<CircleMember | null>(null);

  useEffect(() => {
    if (!uid) return;
    loadMember(uid).then(setMember);
  }, [uid]);

  const isMe = uid === myUid;

  const shareProfile = async () => {
    if (!member) return;
    try {
      await Share.share({
        message: `Add ${member.username} on Get Up & Go with User ID ${member.goerId}`,
      });
    } catch {
      /* dismissed */
    }
  };

  const stats = [
    { icon: Star, value: `${gp.totalGp}`, label: 'Go-Points', color: t.textProgress },
    { icon: Award, value: `${gp.currentLevel?.level ?? 1}`, label: gp.currentLevel?.title ?? 'Level', color: t.textBrand },
    { icon: Users, value: `${member?.circleCount ?? 0}`, label: 'Circles', color: t.textBrand },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: t.bgCanvas }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Back"
          style={[styles.iconButton, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}
        >
          <ChevronLeft size={22} color={t.textPrimary} />
        </Pressable>

        {!member ? (
          <ActivityIndicator color={t.textBrand} style={styles.loader} />
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
              <Avatar name={member.username} avatarPublicId={member.avatarPublicId} size={104} />
              <Text style={[styles.name, { color: t.textPrimary }]}>{isMe ? `${member.username} (you)` : member.username}</Text>
              {member.email ? <Text style={[styles.body, { color: t.textSecondary }]}>{member.email}</Text> : null}
              {member.goerId ? (
                <View style={[styles.idChip, { backgroundColor: t.fillBrandSubtle }]}>
                  <Text style={[styles.idText, { color: t.textBrand }]}>User ID: {member.goerId}</Text>
                </View>
              ) : null}

              <View style={[styles.stats, { borderTopColor: t.borderSubtle }]}>
                {stats.map(({ icon: Icon, value, label, color }) => (
                  <View key={label} style={styles.stat}>
                    <Icon size={20} color={color} />
                    <Text style={[styles.statValue, { color: t.textPrimary }]}>{value}</Text>
                    <Text numberOfLines={1} style={[styles.caption, { color: t.textSecondary }]}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Pressable onPress={shareProfile} style={[styles.primary, { backgroundColor: t.actionPrimary }]}>
              <Share2 size={18} color={t.onActionPrimary} />
              <Text style={[styles.primaryText, { color: t.onActionPrimary }]}>Share profile</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loader: {
    paddingVertical: 48,
  },
  card: {
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 24,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    marginTop: 8,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  idChip: {
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  idText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  primary: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
