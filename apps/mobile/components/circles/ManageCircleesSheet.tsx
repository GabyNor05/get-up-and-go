import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut, UserMinus, UserPlus, X } from 'lucide-react-native';

import { Avatar } from '@/components/ui/Avatar';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { CircleMember } from '@/hooks/useCircles';
import { circleService } from '../../../../packages/firebase/src/services/circlesService';
import { goerService } from '../../../../packages/firebase/src/services/goerService';
import type { Circle } from '../../../../packages/firebase/src/types/circle';
import { fonts, radius } from '../../../../packages/shared-ui/tokens';

interface ManageCircleesSheetProps {
  visible: boolean;
  circle: Circle;
  members: CircleMember[];
  currentUid: string | null;
  onClose: () => void;
  onViewProfile: (uid: string) => void;
  onInvite: () => void;
  onLeave: () => void;
}

/**
 * Members of a Circle. Everyone can view profiles; only the Circle's admin
 * (its creator) can remove Circlees.
 */
export function ManageCircleesSheet({
  visible,
  circle,
  members,
  currentUid,
  onClose,
  onViewProfile,
  onInvite,
  onLeave,
}: ManageCircleesSheetProps) {
  const { t } = useAppTheme();
  const insets = useSafeAreaInsets();
  const adminUid = circle.created_by;
  const isAdmin = !!currentUid && currentUid === adminUid;
  const canInvite = isAdmin || circle.everybody_sends_invites !== false;

  // You first, then the admin, then everyone else alphabetically
  const sorted = [...members].sort((a, b) => {
    const rank = (m: CircleMember) => (m.uid === currentUid ? 0 : m.uid === adminUid ? 1 : 2);
    return rank(a) - rank(b) || a.username.localeCompare(b.username);
  });

  const confirmRemove = (member: CircleMember) => {
    if (!circle.id) return;
    Alert.alert(`Remove ${member.username}?`, `They'll leave ${circle.title}. They can rejoin with the code.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await circleService.removeMemberFromCircle(circle.id as string, member.uid);
            await goerService.leaveCircle(member.uid, circle.id as string);
          } catch (err) {
            console.warn('Remove Circlee failed', err);
            Alert.alert("Couldn't remove them", 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { backgroundColor: t.bgSurface, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.handle, { backgroundColor: t.borderSubtle }]} />
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: t.textPrimary }]}>{circle.title}</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
            <X size={22} color={t.textSecondary} />
          </Pressable>
        </View>
        <Text style={[styles.caption, { color: t.textSecondary }]}>
          {members.length} of {circle.max_size ?? 20} Circlees{isAdmin ? ' · You are the admin' : ''}
        </Text>

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {sorted.map((member) => {
            const isMe = member.uid === currentUid;
            const memberIsAdmin = member.uid === adminUid;
            return (
              <View key={member.uid} style={[styles.row, { backgroundColor: t.bgElevated, borderColor: t.borderSubtle }]}>
                <Avatar name={member.username} avatarPublicId={member.avatarPublicId} size={44} />
                <View style={styles.flex}>
                  <Text numberOfLines={1} style={[styles.name, { color: t.textPrimary }]}>
                    {isMe ? 'You' : member.username}
                    {memberIsAdmin ? ' (Admin)' : ''}
                  </Text>
                  {member.email ? (
                    <Text numberOfLines={1} style={[styles.caption, { color: t.textSecondary }]}>
                      {member.email}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => onViewProfile(member.uid)}
                  style={[styles.smallButton, { backgroundColor: t.fillBrandSubtle }]}
                >
                  <Text style={[styles.smallText, { color: t.textBrand }]}>View</Text>
                </Pressable>
                {isAdmin && !isMe ? (
                  <Pressable
                    onPress={() => confirmRemove(member)}
                    accessibilityLabel={`Remove ${member.username}`}
                    style={[styles.iconButton, { backgroundColor: t.fillDangerSubtle }]}
                  >
                    <UserMinus size={18} color={t.danger} />
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={onLeave} style={[styles.footerButton, styles.outline, { borderColor: t.danger }]}>
            <LogOut size={18} color={t.danger} />
            <Text style={[styles.footerText, { color: t.danger }]}>Leave Circle</Text>
          </Pressable>
          {canInvite ? (
            <Pressable onPress={onInvite} style={[styles.footerButton, { backgroundColor: t.actionPrimary }]}>
              <UserPlus size={18} color={t.onActionPrimary} />
              <Text style={[styles.footerText, { color: t.onActionPrimary }]}>Invite</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.45)',
  },
  sheet: {
    maxHeight: '80%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
    flexShrink: 1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: 8,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  flex: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  smallButton: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallText: {
    fontSize: 13,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  footerButton: {
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
  footerText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
