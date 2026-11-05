import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { CheckCircle2, Lock, MapPinned, QrCode, Star } from 'lucide-react-native';

import { Header } from '@/components/textFormating';
import { ProgressRing } from '@/components/gopoints/ProgressRing';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useGoer } from '@/hooks/useGoer';
import { useGoPoints } from '@/hooks/useGoPoints';
import { db } from '../../../../../packages/firebase/src/config/firebase';
import { CHECK_IN_GP } from '../../../../../packages/firebase/src/services/happeningService';
import type { Happening } from '../../../../../packages/firebase/src/types/happening';
import { fonts, radius, shadows } from '../../../../../packages/shared-ui/tokens';

const LEVEL_TITLES_FALLBACK = ['Starter', 'Explorer', 'Regular', 'Trailblazer', 'Local Legend'];

function formatDate(happening: Happening): string {
  const date = happening.dateTime?.toDate?.();
  return date ? date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '';
}

export default function GoPointsScreen() {
  const router = useRouter();
  const { t } = useAppTheme();
  const { goerId } = useGoer();
  const gp = useGoPoints(goerId);
  const [checkIns, setCheckIns] = useState<Happening[]>([]);
  const [loadingCheckIns, setLoadingCheckIns] = useState(true);

  useEffect(() => {
    if (!goerId) {
      setLoadingCheckIns(false);
      return;
    }
    const load = async () => {
      try {
        const q = query(collection(db, 'happenings'), where('attendees', 'array-contains', goerId));
        const snapshot = await getDocs(q);
        const list = snapshot.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Happening, 'id'>) }))
          .sort((a, b) => (b.dateTime?.toMillis?.() ?? 0) - (a.dateTime?.toMillis?.() ?? 0));
        setCheckIns(list);
      } catch (err) {
        console.warn('Could not load check-ins', err);
      } finally {
        setLoadingCheckIns(false);
      }
    };
    load();
  }, [goerId, gp.totalGp]);

  const level = gp.currentLevel;
  const levelNumber = level?.level ?? 1;

  return (
    <View style={[styles.screen, { backgroundColor: t.bgCanvas }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header pageHeader="Go-Points" subHeading="Show up, check in, level up." />

        {/* Level card */}
        <View style={[styles.levelCard, shadows.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
          {gp.loading ? (
            <ActivityIndicator color={t.textBrand} />
          ) : (
            <>
              <ProgressRing progress={gp.progress} size={132} strokeWidth={12} label={`${gp.totalGp}`} caption="total GP" />
              <Text style={[styles.levelTitle, { color: t.textPrimary }]}>
                Level {levelNumber} · {level?.title ?? LEVEL_TITLES_FALLBACK[0]}
              </Text>
              <Text style={[styles.body, styles.center, { color: t.textSecondary }]}>
                {gp.nextLevel
                  ? `${gp.gpToNext} GP to reach ${gp.nextLevel.title}`
                  : "You've reached the top level. Legend!"}
              </Text>
              <View style={[styles.bar, { backgroundColor: t.fillProgressSubtle }]}>
                <View style={[styles.barFill, { width: `${gp.progress * 100}%`, backgroundColor: t.actionSecondary }]} />
              </View>
            </>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: t.fillProgressSubtle }]}>
            <Star size={18} color={t.textProgress} />
            <Text style={[styles.statValue, { color: t.textPrimary }]}>{gp.monthlyGp}</Text>
            <Text style={[styles.caption, { color: t.textSecondary }]}>GP this month</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: t.fillBrandSubtle }]}>
            <CheckCircle2 size={18} color={t.textBrand} />
            <Text style={[styles.statValue, { color: t.textPrimary }]}>{checkIns.length}</Text>
            <Text style={[styles.caption, { color: t.textSecondary }]}>Check-ins</Text>
          </View>
        </View>

        {/* How to earn */}
        <Pressable
          onPress={() => router.navigate('/(tabs)/nearby')}
          style={[styles.earn, { backgroundColor: t.actionPrimary }]}
        >
          <QrCode size={22} color={t.onActionPrimary} />
          <View style={styles.flex}>
            <Text style={[styles.earnTitle, { color: t.onActionPrimary }]}>+{CHECK_IN_GP} GP per check-in</Text>
            <Text style={[styles.caption, { color: t.onActionPrimary }]}>Find a Happening and scan the venue QR</Text>
          </View>
          <MapPinned size={20} color={t.onActionPrimary} />
        </Pressable>

        {/* Level ladder */}
        <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>Levels</Text>
        <View style={[styles.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
          {LEVEL_TITLES_FALLBACK.map((fallbackTitle, index) => {
            const number = index + 1;
            const reached = number <= levelNumber;
            const isCurrent = number === levelNumber;
            return (
              <View
                key={fallbackTitle}
                style={[styles.levelRow, index < 4 && { borderBottomWidth: 1, borderBottomColor: t.borderSubtle }]}
              >
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: reached ? t.actionSecondary : t.bgElevated, borderColor: t.borderSubtle },
                  ]}
                >
                  {reached ? (
                    <Text style={[styles.levelBadgeText, { color: t.onActionSecondary }]}>{number}</Text>
                  ) : (
                    <Lock size={14} color={t.textSecondary} />
                  )}
                </View>
                <Text style={[styles.levelName, { color: reached ? t.textPrimary : t.textSecondary }]}>
                  {fallbackTitle}
                </Text>
                {isCurrent ? (
                  <View style={[styles.currentChip, { backgroundColor: t.fillBrandSubtle }]}>
                    <Text style={[styles.currentText, { color: t.textBrand }]}>You're here</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Recent check-ins */}
        <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>Recent check-ins</Text>
        <View style={[styles.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
          {loadingCheckIns ? (
            <ActivityIndicator color={t.textBrand} style={styles.loader} />
          ) : checkIns.length === 0 ? (
            <Text style={[styles.body, styles.padded, { color: t.textSecondary }]}>
              No check-ins yet. Your first one is worth {CHECK_IN_GP} GP!
            </Text>
          ) : (
            checkIns.slice(0, 5).map((happening, index) => (
              <View
                key={happening.id}
                style={[
                  styles.checkInRow,
                  index < Math.min(checkIns.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: t.borderSubtle },
                ]}
              >
                <CheckCircle2 size={20} color={t.textProgress} />
                <View style={styles.flex}>
                  <Text numberOfLines={1} style={[styles.checkInTitle, { color: t.textPrimary }]}>
                    {happening.title}
                  </Text>
                  <Text style={[styles.caption, { color: t.textSecondary }]}>{formatDate(happening)}</Text>
                </View>
                <Text style={[styles.gpEarned, { color: t.textProgress }]}>+{CHECK_IN_GP}</Text>
              </View>
            ))
          )}
        </View>
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
  levelCard: {
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 24,
    marginTop: 8,
  },
  levelTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
    marginTop: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  center: {
    textAlign: 'center',
  },
  padded: {
    paddingVertical: 12,
  },
  bar: {
    width: '100%',
    height: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 16,
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
  earn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.lg,
    padding: 16,
  },
  earnTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  flex: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
    marginTop: 8,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  loader: {
    paddingVertical: 16,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  levelName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  currentChip: {
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  currentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  checkInTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  gpEarned: {
    fontSize: 15,
    fontWeight: '700',
  },
});
