import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronLeft, LogOut, Share2 } from 'lucide-react-native';

import { Podium } from '@/components/circles/Podium';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useGoer } from '@/hooks/useGoer';
import { useCircle } from '@/hooks/useCircles';
import { describeFeedItem, timeAgo, useCircleFeed } from '@/hooks/useCircleFeed';
import { circleService } from '../../../../../../packages/firebase/src/services/circlesService';
import { goerService } from '../../../../../../packages/firebase/src/services/goerService';
import { happeningService } from '../../../../../../packages/firebase/src/services/happeningService';
import { circleFeedService } from '../../../../../../packages/firebase/src/services/circleFeedService';
import type { CircleFeedItem } from '../../../../../../packages/firebase/src/types/circleFeed';
import { fonts, radius } from '../../../../../../packages/shared-ui/tokens';

export default function CircleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, isDark } = useAppTheme();
  const { goerId, username } = useGoer();
  const { circle, members, loading } = useCircle(id);
  const feed = useCircleFeed(id ? [id] : [], 20);
  const [meTooIds, setMeTooIds] = useState<Set<string>>(new Set());

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/(circles)'));

  const handleShare = async () => {
    if (!circle) return;
    try {
      await Share.share({
        message: `Join my Circle "${circle.title}" on Get Up & Go with code ${circle.join_code ?? circle.id}`,
      });
    } catch {
      /* share sheet dismissed */
    }
  };

  const handleMeToo = async (item: CircleFeedItem) => {
    if (!goerId || !item.happening_id || !item.id) return;
    try {
      // RSVP Yes to the same Happening (false = not currently RSVP'd → add)
      await happeningService.toggleRsvp(item.happening_id, goerId, false);
      setMeTooIds((prev) => new Set(prev).add(item.id as string));
      await circleFeedService.postToMyCircles({
        goerUid: goerId,
        username,
        type: 'me_too',
        happeningId: item.happening_id,
        happeningTitle: item.happening_title,
        circleIds: id ? [id] : undefined,
      });
    } catch (err) {
      console.warn('Me Too failed', err);
      Alert.alert("Couldn't RSVP", 'Check your connection and try again.');
    }
  };

  const handleLeave = () => {
    if (!circle?.id || !goerId) return;
    Alert.alert('Leave this Circle?', `You can rejoin later with the code ${circle.join_code ?? ''}.`, [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await circleService.removeMemberFromCircle(circle.id as string, goerId);
            await goerService.leaveCircle(goerId, circle.id as string);
            goBack();
          } catch (err) {
            console.warn('Leave Circle failed', err);
            Alert.alert("Couldn't leave the Circle", 'Please try again.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgCanvas }]}>
        <ActivityIndicator color={t.textBrand} />
      </View>
    );
  }

  if (!circle) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgCanvas }]}>
        <Text style={[styles.body, { color: t.textSecondary }]}>This Circle doesn't exist anymore.</Text>
        <Pressable onPress={goBack} style={[styles.secondaryButton, { borderColor: t.borderStrong }]}>
          <Text style={[styles.secondaryText, { color: t.textPrimary }]}>Back to Circles</Text>
        </Pressable>
      </View>
    );
  }

  const heroBg = isDark ? circle.card_bg?.dark : circle.card_bg?.light;

  return (
    <View style={[styles.screen, { backgroundColor: t.bgCanvas }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={goBack}
            accessibilityLabel="Back"
            style={[styles.iconButton, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}
          >
            <ChevronLeft size={22} color={t.textPrimary} />
          </Pressable>
          <Pressable
            onPress={handleShare}
            style={[styles.codeChip, { backgroundColor: t.fillBrandSubtle }]}
            accessibilityLabel="Share Circle code"
          >
            <Share2 size={16} color={t.textBrand} />
            <Text style={[styles.codeText, { color: t.textBrand }]}>{circle.join_code ?? 'Share'}</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: heroBg ?? t.bgSurface, borderColor: t.borderSubtle }]}>
          <View style={[styles.heroBlob, { backgroundColor: circle.accent }]} />
          <Text style={styles.heroEmoji}>{circle.emoji}</Text>
          <Text style={[styles.heroTitle, { color: t.textPrimary }]}>{circle.title}</Text>
          <Text style={[styles.body, { color: t.textSecondary }]}>
            {members.length} {members.length === 1 ? 'member' : 'members'} · Top Goers this month
          </Text>
          <Podium members={members} currentUid={goerId} />
        </View>

        {/* Ranked list */}
        {members.length > 3 ? (
          <View style={[styles.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
            {members.slice(3).map((member, index) => (
              <View
                key={member.uid}
                style={[
                  styles.memberRow,
                  index < members.length - 4 && { borderBottomWidth: 1, borderBottomColor: t.borderSubtle },
                ]}
              >
                <Text style={[styles.rank, { color: t.textSecondary }]}>{index + 4}</Text>
                <View style={[styles.avatar, { backgroundColor: t.fillBrandSubtle }]}>
                  <Text style={[styles.avatarText, { color: t.textBrand }]}>{member.username.charAt(0)}</Text>
                </View>
                <Text numberOfLines={1} style={[styles.memberName, { color: t.textPrimary }]}>
                  {member.uid === goerId ? 'You' : member.username}
                </Text>
                <Text style={[styles.memberGp, { color: t.textProgress }]}>{member.monthlyGp} GP</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* What We're Doing */}
        <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>What we're doing</Text>
        <View style={[styles.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
          {feed.loading ? (
            <ActivityIndicator color={t.textBrand} style={styles.loader} />
          ) : feed.items.length === 0 ? (
            <Text style={[styles.body, { color: t.textSecondary }]}>
              Nothing yet. RSVP to a Happening and your Circle will see it here.
            </Text>
          ) : (
            feed.items.map((item, index) => {
              const canMeToo =
                !!item.happening_id && item.goer_uid !== goerId && (item.type === 'rsvp' || item.type === 'check_in');
              const done = !!item.id && meTooIds.has(item.id);
              return (
                <View
                  key={item.id ?? index}
                  style={[
                    styles.feedRow,
                    index < feed.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.borderSubtle },
                  ]}
                >
                  <View style={[styles.avatar, { backgroundColor: t.fillBrandSubtle }]}>
                    <Text style={[styles.avatarText, { color: t.textBrand }]}>{item.username.charAt(0)}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.body, { color: t.textPrimary }]}>
                      <Text style={styles.bold}>{item.goer_uid === goerId ? 'You' : item.username}</Text>{' '}
                      {describeFeedItem(item)}
                    </Text>
                    <Text style={[styles.caption, { color: t.textSecondary }]}>
                      {item.created_at ? timeAgo(item.created_at.toMillis()) : 'just now'}
                    </Text>
                  </View>
                  {canMeToo ? (
                    <Pressable
                      onPress={() => handleMeToo(item)}
                      disabled={done}
                      style={[styles.meToo, { backgroundColor: done ? t.actionSecondary : t.actionPrimary }]}
                    >
                      {done ? <Check size={14} color={t.onActionSecondary} /> : null}
                      <Text style={[styles.meTooText, { color: done ? t.onActionSecondary : t.onActionPrimary }]}>
                        Me Too
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        <Pressable onPress={handleLeave} style={[styles.leave, { borderColor: t.danger }]}>
          <LogOut size={16} color={t.danger} />
          <Text style={[styles.secondaryText, { color: t.danger }]}>Leave Circle</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  codeText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  hero: {
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    overflow: 'hidden',
    gap: 4,
  },
  heroBlob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -110,
    right: -60,
    opacity: 0.35,
  },
  heroEmoji: {
    fontSize: 40,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
    textAlign: 'center',
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  loader: {
    paddingVertical: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  rank: {
    width: 20,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  memberGp: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
    marginTop: 8,
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  flex: {
    flex: 1,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  meToo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  meTooText: {
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
  leave: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginTop: 8,
  },
});
