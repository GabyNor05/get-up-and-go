import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { Circle } from '../../../../packages/firebase/src/types/circle';
import { fonts, radius } from '../../../../packages/shared-ui/tokens';

export type CircleCardVariant = 'tall' | 'normal' | 'wide';

interface CircleCardProps {
  circle: Circle;
  variant: CircleCardVariant;
  onPress: () => void;
}

export function CircleCard({ circle, variant, onPress }: CircleCardProps) {
  const { t, isDark } = useAppTheme();
  const cardBg = isDark ? circle.card_bg?.dark : circle.card_bg?.light;
  const memberCount = circle.goer_ids?.length ?? 0;
  const isTall = variant === 'tall';
  const isWide = variant === 'wide';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${circle.title}`}
      style={[
        styles.card,
        !isWide && styles.fill,
        isTall && styles.tall,
        isWide && styles.wide,
        { backgroundColor: cardBg ?? t.bgSurface, borderColor: t.borderSubtle },
      ]}
    >
      <View style={[styles.blob, { backgroundColor: circle.accent }]} />

      <View style={[styles.emojiBadge, { backgroundColor: t.bgElevated }]}>
        <Text style={styles.emoji}>{circle.emoji}</Text>
      </View>

      <View style={isWide ? styles.wideBody : styles.body}>
        <View style={styles.flexShrink}>
          <Text numberOfLines={2} style={[styles.title, isTall && styles.titleLarge, { color: t.textPrimary }]}>
            {circle.title}
          </Text>
          <Text style={[styles.meta, { color: t.textSecondary }]}>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </Text>
        </View>

        {circle.tags?.length ? (
          <View style={styles.tags}>
            {circle.tags.slice(0, isTall || isWide ? 3 : 2).map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: t.bgElevated }]}>
                <Text style={[styles.tagText, { color: t.textPrimary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={[styles.open, { backgroundColor: t.bgElevated }]}>
        <ChevronRight size={18} color={t.textPrimary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 150,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
    gap: 12,
  },
  // Tall and stacked cards stretch so both bento columns end on the same line
  fill: {
    flex: 1,
  },
  tall: {
    minHeight: 312,
  },
  wide: {
    minHeight: 120,
  },
  blob: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    right: -40,
    bottom: -50,
    opacity: 0.35,
  },
  emojiBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 10,
  },
  wideBody: {
    flex: 1,
    gap: 8,
  },
  flexShrink: {
    flexShrink: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
  },
  titleLarge: {
    fontSize: 24,
    lineHeight: 28,
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  open: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
