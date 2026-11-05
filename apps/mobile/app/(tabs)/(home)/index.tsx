import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronRight, MapPin, MapPinned, Sparkles, Users } from 'lucide-react-native';

import { Header } from '@/components/textFormating';
import { ProgressRing } from '@/components/gopoints/ProgressRing';
import HappeningDetailDrawer from '@/components/nearby/HappeningDetailDrawer';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useGoer } from '@/hooks/useGoer';
import { useGoPoints } from '@/hooks/useGoPoints';
import { describeFeedItem, timeAgo, useCircleFeed } from '@/hooks/useCircleFeed';
import { happeningService } from '../../../../../packages/firebase/src/services/happeningService';
import type { Happening } from '../../../../../packages/firebase/src/types/happening';
import { categoryColors, fonts, radius, shadows, type CategoryKey } from '../../../../../packages/shared-ui/tokens';

const SOON_LIMIT = 6;
const CARD_WIDTH = 220;

function todayLabel(): string {
  return new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatWhen(happening: Happening): string {
  const date = happening.dateTime?.toDate?.();
  if (!date) return 'Date TBC';
  return date.toLocaleString('en-ZA', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function HomeScreen() {
  const router = useRouter();
  const { t, isDark } = useAppTheme();
  const { goerId, username } = useGoer();
  const goPoints = useGoPoints(goerId);
  const circleIds = goPoints.goer?.circles ?? [];
  const feed = useCircleFeed(circleIds, 3);

  const [happenings, setHappenings] = useState<Happening[]>([]);
  const [loadingSoon, setLoadingSoon] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const upcoming = await happeningService.getUpcomingHappenings();
        setHappenings(upcoming.slice(0, SOON_LIMIT));
      } catch (err) {
        console.warn('Could not load upcoming Happenings', err);
      } finally {
        setLoadingSoon(false);
      }
    };
    load();
  }, []);

  const levelLabel = useMemo(() => {
    const level = goPoints.currentLevel;
    return level ? `Level ${level.level} · ${level.title}` : 'Level 1';
  }, [goPoints.currentLevel]);

  const goToRewards = () => router.navigate('/(tabs)/(achievements)');
  const goToNearby = () => router.navigate('/(tabs)/nearby');
  const goToCircles = () => router.navigate('/(tabs)/(circles)');

  const renderHappening = useCallback(
    ({ item }: { item: Happening }) => {
      const accent = categoryColors[item.category as CategoryKey] ?? categoryColors.ALL;
      return (
        <Pressable
          onPress={() => setSelectedId(item.id)}
          style={[styles.soonCard, shadows.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}
        >
          <View style={[styles.soonImage, { backgroundColor: t.fillBrandSubtle }]}>
            {item.thumbnail_url ? (
              <Image source={{ uri: item.thumbnail_url }} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : null}
            <View style={[styles.categoryChip, { backgroundColor: accent }]}>
              <Text style={styles.categoryChipText}>{item.category}</Text>
            </View>
          </View>
          <View style={styles.soonBody}>
            <Text numberOfLines={1} style={[styles.soonTitle, { color: t.textPrimary }]}>
              {item.title}
            </Text>
            <Text numberOfLines={1} style={[styles.caption, { color: t.textSecondary }]}>
              {formatWhen(item)}
            </Text>
            <View style={styles.inlineRow}>
              <MapPin size={12} color={t.textBrand} />
              <Text numberOfLines={1} style={[styles.caption, styles.flexShrink, { color: t.textSecondary }]}>
                {item.locationName}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [t],
  );

  return (
    <View style={[styles.screen, { backgroundColor: t.bgCanvas }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header pageHeader={`Hi ${username}!`} subHeading={todayLabel()} />

        {/* Go-Points */}
        <Pressable
          onPress={goToRewards}
          accessibilityRole="button"
          accessibilityLabel="Open Go-Points"
          style={[styles.card, styles.gpCard, shadows.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}
        >
          <ProgressRing progress={goPoints.progress} label={`${goPoints.totalGp}`} caption="GP" />
          <View style={styles.flex}>
            <Text style={[styles.cardTitle, { color: t.textPrimary }]}>{levelLabel}</Text>
            <Text style={[styles.body, { color: t.textSecondary }]}>
              {goPoints.nextLevel
                ? `${goPoints.gpToNext} GP to ${goPoints.nextLevel.title}`
                : 'Top level reached!'}
            </Text>
            <View style={[styles.pill, { backgroundColor: t.fillProgressSubtle }]}>
              <Sparkles size={14} color={t.textProgress} />
              <Text style={[styles.pillText, { color: t.textProgress }]}>+{goPoints.monthlyGp} GP this month</Text>
            </View>
          </View>
          <ChevronRight size={20} color={t.textSecondary} />
        </Pressable>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <Pressable
            onPress={goToNearby}
            style={[styles.quickAction, { backgroundColor: t.actionPrimary }]}
          >
            <MapPinned size={20} color={t.onActionPrimary} />
            <Text style={[styles.quickLabel, { color: t.onActionPrimary }]}>Find Happenings</Text>
          </Pressable>
          <Pressable
            onPress={goToCircles}
            style={[styles.quickAction, { backgroundColor: t.fillBrandSubtle }]}
          >
            <Users size={20} color={t.textBrand} />
            <Text style={[styles.quickLabel, { color: t.textBrand }]}>My Circles</Text>
          </Pressable>
        </View>

        {/* Circle activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>Your Circles lately</Text>
          <Pressable onPress={goToCircles} hitSlop={12}>
            <Text style={[styles.link, { color: t.textBrand }]}>See all</Text>
          </Pressable>
        </View>
        <View style={[styles.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
          {feed.loading ? (
            <ActivityIndicator color={t.textBrand} style={styles.loader} />
          ) : feed.items.length === 0 ? (
            <Pressable onPress={goToCircles} style={styles.emptyRow}>
              <Text style={[styles.body, { color: t.textSecondary }]}>
                Join a Circle to see what your crew is up to.
              </Text>
              <ChevronRight size={18} color={t.textSecondary} />
            </Pressable>
          ) : (
            feed.items.map((item, index) => (
              <Pressable
                key={item.id ?? index}
                onPress={() => (item.circle_id ? router.push(`/(tabs)/(circles)/${item.circle_id}`) : goToCircles())}
                style={[
                  styles.feedRow,
                  index < feed.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.borderSubtle },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: t.fillBrandSubtle }]}>
                  <Text style={[styles.avatarText, { color: t.textBrand }]}>{item.username.charAt(0)}</Text>
                </View>
                <View style={styles.flex}>
                  <Text numberOfLines={2} style={[styles.body, { color: t.textPrimary }]}>
                    <Text style={styles.bold}>{item.username}</Text> {describeFeedItem(item)}
                  </Text>
                  <Text style={[styles.caption, { color: t.textSecondary }]}>
                    {item.created_at ? timeAgo(item.created_at.toMillis()) : ''}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* Upcoming Happenings */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>Happening soon</Text>
          <Pressable onPress={goToNearby} hitSlop={12}>
            <Text style={[styles.link, { color: t.textBrand }]}>See all</Text>
          </Pressable>
        </View>
        {loadingSoon ? (
          <ActivityIndicator color={t.textBrand} style={styles.loader} />
        ) : happenings.length === 0 ? (
          <View style={[styles.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
            <Text style={[styles.body, { color: t.textSecondary }]}>
              No upcoming Happenings yet. Check back soon!
            </Text>
          </View>
        ) : (
          <FlatList
            horizontal
            data={happenings}
            keyExtractor={(item) => item.id}
            renderItem={renderHappening}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.soonList}
            style={styles.soonListOuter}
          />
        )}
      </ScrollView>

      <HappeningDetailDrawer darkMode={isDark} eventId={selectedId} onClose={() => setSelectedId(null)} />
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
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
  },
  gpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  flex: {
    flex: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
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
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
  },
  quickLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
  },
  link: {
    fontSize: 13,
    fontWeight: '700',
  },
  loader: {
    paddingVertical: 16,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
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
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  soonListOuter: {
    marginHorizontal: -16,
  },
  soonList: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  soonCard: {
    width: CARD_WIDTH,
    flexShrink: 0,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  soonImage: {
    height: 120,
  },
  categoryChip: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#24221B',
  },
  soonBody: {
    padding: 12,
    gap: 4,
  },
  soonTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
});
