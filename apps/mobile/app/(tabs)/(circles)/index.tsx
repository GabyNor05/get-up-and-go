import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Link2, Plus, Users } from 'lucide-react-native';

import { Header } from '@/components/textFormating';
import { CircleCard } from '@/components/circles/CircleCard';
import { JoinCircleSheet } from '@/components/circles/JoinCircleSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useGoer } from '@/hooks/useGoer';
import { useMyCircles } from '@/hooks/useCircles';
import type { Circle } from '../../../../../packages/firebase/src/types/circle';
import { fonts, radius } from '../../../../../packages/shared-ui/tokens';

/** Bento rhythm: tall + two stacked, then one wide — repeats every 4 */
function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export default function CirclesScreen() {
  const router = useRouter();
  const { t } = useAppTheme();
  const { goerId, username } = useGoer();
  const { circles, loading, error } = useMyCircles(goerId);
  const [joinOpen, setJoinOpen] = useState(false);

  const openCircle = (circle: Circle) => {
    if (!circle.id) return;
    router.push({ pathname: '/(tabs)/(circles)/[id]', params: { id: circle.id } });
  };

  const subheading = loading
    ? 'Loading your Circles…'
    : circles.length === 1
      ? '1 active Circle'
      : `${circles.length} active Circles`;

  const renderGrid = () =>
    chunk(circles, 4).map((group, index) => (
      <View key={group[0].id ?? index} style={styles.group}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <CircleCard circle={group[0]} variant={group.length > 1 ? 'tall' : 'normal'} onPress={() => openCircle(group[0])} />
          </View>
          {group[1] ? (
            <View style={[styles.flex, styles.stack]}>
              <CircleCard circle={group[1]} variant="normal" onPress={() => openCircle(group[1])} />
              {group[2] ? <CircleCard circle={group[2]} variant="normal" onPress={() => openCircle(group[2])} /> : null}
            </View>
          ) : null}
        </View>
        {group[3] ? <CircleCard circle={group[3]} variant="wide" onPress={() => openCircle(group[3])} /> : null}
      </View>
    ));

  return (
    <View style={[styles.screen, { backgroundColor: t.bgCanvas }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header pageHeader="My Circles" subHeading={subheading} />

        {loading ? (
          <ActivityIndicator color={t.textBrand} style={styles.loader} />
        ) : error ? (
          <Text style={[styles.body, { color: t.danger }]}>{error}</Text>
        ) : circles.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
            <View style={[styles.emptyIcon, { backgroundColor: t.fillBrandSubtle }]}>
              <Users size={28} color={t.textBrand} />
            </View>
            <Text style={[styles.emptyTitle, { color: t.textPrimary }]}>Get out together</Text>
            <Text style={[styles.body, styles.center, { color: t.textSecondary }]}>
              Start a Circle with your crew, or join one with a code from a friend.
            </Text>
          </View>
        ) : (
          renderGrid()
        )}
      </ScrollView>

      {/* Thumb-zone actions */}
      <View style={[styles.actions, { backgroundColor: t.bgCanvas, borderTopColor: t.borderSubtle }]}>
        <Pressable
          onPress={() => setJoinOpen(true)}
          style={[styles.actionButton, styles.outline, { borderColor: t.borderStrong }]}
        >
          <Link2 size={18} color={t.textPrimary} />
          <Text style={[styles.actionText, { color: t.textPrimary }]}>Join Circle</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(tabs)/(circles)/newCircleForm')}
          style={[styles.actionButton, { backgroundColor: t.actionPrimary }]}
        >
          <Plus size={18} color={t.onActionPrimary} />
          <Text style={[styles.actionText, { color: t.onActionPrimary }]}>New Circle</Text>
        </Pressable>
      </View>

      <JoinCircleSheet
        visible={joinOpen}
        goerId={goerId}
        username={username}
        onClose={() => setJoinOpen(false)}
        onJoined={(id) => router.push({ pathname: '/(tabs)/(circles)/[id]', params: { id } })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  loader: {
    paddingVertical: 32,
  },
  group: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  stack: {
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  center: {
    textAlign: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    padding: 24,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: 8,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
  },
  outline: {
    borderWidth: 1.5,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
