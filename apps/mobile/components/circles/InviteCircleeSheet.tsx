import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share2, X } from 'lucide-react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { loadMember } from '@/hooks/useCircles';
import { circleService } from '../../../../packages/firebase/src/services/circlesService';
import { goerService } from '../../../../packages/firebase/src/services/goerService';
import { circleFeedService } from '../../../../packages/firebase/src/services/circleFeedService';
import type { Circle } from '../../../../packages/firebase/src/types/circle';
import { fonts, radius } from '../../../../packages/shared-ui/tokens';

interface InviteCircleeSheetProps {
  visible: boolean;
  circle: Circle;
  onClose: () => void;
}

/** Share the Circle code, or add a friend straight away by their Goer ID */
export function InviteCircleeSheet({ visible, circle, onClose }: InviteCircleeSheetProps) {
  const { t } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [goerIdInput, setGoerIdInput] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [adding, setAdding] = useState(false);

  const code = circle.join_code ?? '';
  const isFull = (circle.goer_ids?.length ?? 0) >= (circle.max_size ?? 20);

  const close = () => {
    setGoerIdInput('');
    setMessage(null);
    onClose();
  };

  const shareCode = async () => {
    try {
      await Share.share({ message: `Join my Circle "${circle.title}" on Get Up & Go with code ${code}` });
    } catch {
      /* dismissed */
    }
  };

  const addByGoerId = async () => {
    if (!circle.id || !goerIdInput.trim()) return;
    if (isFull) {
      setMessage({ text: 'This Circle is full.', isError: true });
      return;
    }
    setAdding(true);
    setMessage(null);
    try {
      const goer = await goerService.findByGoerId(goerIdInput);
      if (!goer) {
        setMessage({ text: 'No Goer has that User ID. Check it on their profile.', isError: true });
        return;
      }
      if (circle.goer_ids?.includes(goer.uid)) {
        setMessage({ text: "They're already in this Circle.", isError: true });
        return;
      }
      await circleService.addMemberToCircle(circle.id, goer.uid);
      await goerService.joinCircle(goer.uid, circle.id);
      const member = await loadMember(goer.uid);
      await circleFeedService.postToMyCircles({
        goerUid: goer.uid,
        username: member.username,
        type: 'joined',
        circleIds: [circle.id],
      });
      setGoerIdInput('');
      setMessage({ text: `${member.username} is now in ${circle.title}!`, isError: false });
    } catch (err) {
      console.warn('Add Circlee failed', err);
      setMessage({ text: 'Something went wrong. Try again.', isError: true });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { backgroundColor: t.bgSurface, paddingBottom: insets.bottom + 24 }]}>
          <View style={[styles.handle, { backgroundColor: t.borderSubtle }]} />
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: t.textPrimary }]}>Invite Circlees</Text>
            <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close">
              <X size={22} color={t.textSecondary} />
            </Pressable>
          </View>

          {/* Share code */}
          <View style={[styles.codeCard, { backgroundColor: t.fillBrandSubtle }]}>
            <Text style={[styles.caption, { color: t.textBrand }]}>Circle code</Text>
            <Text selectable style={[styles.code, { color: t.textBrand }]}>{code}</Text>
            <Pressable onPress={shareCode} style={[styles.button, { backgroundColor: t.actionPrimary }]}>
              <Share2 size={18} color={t.onActionPrimary} />
              <Text style={[styles.buttonText, { color: t.onActionPrimary }]}>Share Circle</Text>
            </Pressable>
          </View>

          {/* Add by Goer ID */}
          <Text style={[styles.label, { color: t.textPrimary }]}>Or add a friend by their User ID</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={goerIdInput}
              onChangeText={(value) => setGoerIdInput(value.toUpperCase())}
              placeholder="ZDUX-08-DP"
              placeholderTextColor={t.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
              onSubmitEditing={addByGoerId}
              style={[styles.input, { color: t.textPrimary, backgroundColor: t.bgElevated, borderColor: t.borderSubtle }]}
            />
            <Pressable
              onPress={addByGoerId}
              disabled={adding || !goerIdInput.trim()}
              style={[styles.addButton, { backgroundColor: goerIdInput.trim() ? t.actionPrimary : t.borderSubtle }]}
            >
              {adding ? (
                <ActivityIndicator color={t.onActionPrimary} />
              ) : (
                <Text style={[styles.buttonText, { color: goerIdInput.trim() ? t.onActionPrimary : t.textSecondary }]}>
                  Add
                </Text>
              )}
            </Pressable>
          </View>
          {message ? (
            <Text style={[styles.message, { color: message.isError ? t.danger : t.textProgress }]}>{message.text}</Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.45)',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
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
  },
  codeCard: {
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.lg,
    padding: 16,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  code: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 2,
  },
  button: {
    alignSelf: 'stretch',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  addButton: {
    minWidth: 80,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
  },
});
