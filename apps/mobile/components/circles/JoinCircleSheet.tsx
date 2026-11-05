import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { circleService } from '../../../../packages/firebase/src/services/circlesService';
import { goerService } from '../../../../packages/firebase/src/services/goerService';
import { circleFeedService } from '../../../../packages/firebase/src/services/circleFeedService';
import { fonts, radius } from '../../../../packages/shared-ui/tokens';

interface JoinCircleSheetProps {
  visible: boolean;
  goerId: string | null;
  username: string;
  onClose: () => void;
  onJoined: (circleId: string) => void;
}

export function JoinCircleSheet({ visible, goerId, username, onClose, onJoined }: JoinCircleSheetProps) {
  const { t } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const close = () => {
    setCode('');
    setError(null);
    onClose();
  };

  const handleJoin = async () => {
    if (!goerId) {
      setError('Please log in to join a Circle.');
      return;
    }
    if (code.trim().length < 4) {
      setError('Enter the code your friend shared, e.g. GRLZ-4TQ.');
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const circle = await circleService.getCircleByJoinCode(code);
      if (!circle?.id) {
        setError("We couldn't find a Circle with that code. Check it and try again.");
        return;
      }
      if (circle.goer_ids?.includes(goerId)) {
        close();
        onJoined(circle.id);
        return;
      }
      if ((circle.goer_ids?.length ?? 0) >= (circle.max_size ?? 20)) {
        setError('That Circle is full.');
        return;
      }
      await circleService.addMemberToCircle(circle.id, goerId);
      await goerService.joinCircle(goerId, circle.id);
      await circleFeedService.postToMyCircles({ goerUid: goerId, username, type: 'joined', circleIds: [circle.id] });
      close();
      onJoined(circle.id);
    } catch (err) {
      console.warn('Join Circle failed', err);
      setError('Something went wrong joining that Circle. Try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { backgroundColor: t.bgSurface, paddingBottom: insets.bottom + 24 }]}>
          <View style={[styles.handle, { backgroundColor: t.borderSubtle }]} />
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: t.textPrimary }]}>Join a Circle</Text>
            <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close">
              <X size={22} color={t.textSecondary} />
            </Pressable>
          </View>
          <Text style={[styles.body, { color: t.textSecondary }]}>Ask a friend for their Circle code.</Text>

          <TextInput
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase())}
            placeholder="GRLZ-4TQ"
            placeholderTextColor={t.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
            onSubmitEditing={handleJoin}
            style={[styles.input, { color: t.textPrimary, backgroundColor: t.bgElevated, borderColor: error ? t.danger : t.borderSubtle }]}
          />
          {error ? <Text style={[styles.error, { color: t.danger }]}>{error}</Text> : null}

          <Pressable
            onPress={handleJoin}
            disabled={joining}
            style={[styles.button, { backgroundColor: t.actionPrimary, opacity: joining ? 0.7 : 1 }]}
          >
            {joining ? (
              <ActivityIndicator color={t.onActionPrimary} />
            ) : (
              <Text style={[styles.buttonText, { color: t.onActionPrimary }]}>Join Circle</Text>
            )}
          </Pressable>
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
    paddingHorizontal: 20,
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
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  input: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
