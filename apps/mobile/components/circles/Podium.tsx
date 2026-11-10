import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { CircleMember } from '@/hooks/useCircles';
import { fonts, radius } from '../../../../packages/shared-ui/tokens';

interface PodiumProps {
  /** Members already sorted by GP this month, highest first */
  members: CircleMember[];
  currentUid: string | null;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const BLOCK_HEIGHTS = [112, 84, 64];
const AVATAR_SIZES = [68, 56, 56];

/** Top 3 of the month, laid out 2nd · 1st · 3rd */
export function Podium({ members, currentUid }: PodiumProps) {
  const { t } = useAppTheme();
  const top = members.slice(0, 3);
  if (top.length === 0) return null;

  const order = [1, 0, 2].filter((place) => place < top.length);
  const blockColors = [t.actionPrimary, t.fillBrandSubtle, t.fillProgressSubtle];
  const blockText = [t.onActionPrimary, t.textBrand, t.textProgress];

  return (
    <View style={styles.row} accessibilityRole="summary" accessibilityLabel="This month's top three">
      {order.map((place) => {
        const member = top[place];
        const isMe = member.uid === currentUid;
        const size = AVATAR_SIZES[place];
        return (
          <View key={member.uid} style={styles.column}>
            {place === 0 ? <Text style={styles.crown}>👑</Text> : null}
            <View
              style={[
                styles.avatar,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: place === 0 ? t.actionSecondary : t.bgElevated,
                  borderColor: isMe ? t.focusRing : t.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.initial, { color: place === 0 ? t.onActionSecondary : t.textPrimary, fontSize: size * 0.38 }]}>
                {member.username.charAt(0).toUpperCase()}
              </Text>
              <Text style={styles.medal}>{MEDALS[place]}</Text>
            </View>
            <Text numberOfLines={1} style={[styles.name, { color: t.textPrimary }]}>
              {isMe ? 'You' : member.username}
            </Text>
            <Text style={[styles.gp, { color: t.textProgress }]}>{member.monthlyGp} GP</Text>
            <View style={[styles.block, { height: BLOCK_HEIGHTS[place], backgroundColor: blockColors[place] }]}>
              <Text style={[styles.place, { color: blockText[place] }]}>{place + 1}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 8,
  },
  column: {
    width: 96,
    alignItems: 'center',
  },
  crown: {
    fontSize: 22,
    marginBottom: -4,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  initial: {
    fontFamily: fonts.display,
  },
  medal: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    fontSize: 20,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    maxWidth: 96,
  },
  gp: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  block: {
    width: '100%',
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  place: {
    fontFamily: fonts.display,
    fontSize: 28,
  },
});
