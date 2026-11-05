import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { Check } from 'lucide-react-native';

import { Avatar } from '@/components/ui/Avatar';
import { FormField } from '@/components/ui/FormField';
import { AVATAR_PUBLIC_IDS } from '@/constants/avatars';
import { useAppTheme } from '@/hooks/useAppTheme';
import { db } from '../../../../packages/firebase/src/config/firebase';
import { userService } from '../../../../packages/firebase/src/services/userService';
import { goerService } from '../../../../packages/firebase/src/services/goerService';
import { radius } from '../../../../packages/shared-ui/tokens';

interface EditProfilePanelProps {
  goerId: string;
  username: string;
  onSaved: () => void;
}

const MAX_USERNAME = 24;

export function EditProfilePanel({ goerId, username, onSaved }: EditProfilePanelProps) {
  const { t } = useAppTheme();
  const [name, setName] = useState(username);
  const [avatar, setAvatar] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'goers', goerId))
      .then((snap) => setAvatar((snap.data()?.avatarPublicId as string | undefined) ?? ''))
      .catch(() => {});
  }, [goerId]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Use at least 2 characters.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await userService.updateUser(goerId, { username: trimmed });
      if (avatar) await goerService.updateGoer(goerId, { avatarPublicId: avatar });
      onSaved();
    } catch (err) {
      console.warn('Profile update failed', err);
      Alert.alert("Couldn't save your profile", 'Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.preview}>
        <Avatar name={name || username} avatarPublicId={avatar} size={88} />
      </View>

      <Text style={[styles.label, { color: t.textPrimary }]}>Avatar</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
        {AVATAR_PUBLIC_IDS.map((id) => {
          const selected = avatar === id;
          return (
            <Pressable
              key={id}
              onPress={() => setAvatar(id)}
              accessibilityLabel="Avatar option"
              accessibilityState={{ selected }}
              style={[styles.avatarOption, { borderColor: selected ? t.focusRing : 'transparent' }]}
            >
              <Avatar name={name || username} avatarPublicId={id} size={52} />
              {selected ? (
                <View style={[styles.check, { backgroundColor: t.actionPrimary, borderColor: t.bgSurface }]}>
                  <Check size={10} color={t.onActionPrimary} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <FormField
        label="Username"
        value={name}
        onChangeText={setName}
        maxLength={MAX_USERNAME}
        autoCapitalize="none"
        autoCorrect={false}
        error={error}
      />

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={[styles.button, { backgroundColor: t.actionPrimary, opacity: saving ? 0.7 : 1 }]}
      >
        {saving ? (
          <ActivityIndicator color={t.onActionPrimary} />
        ) : (
          <Text style={[styles.buttonText, { color: t.onActionPrimary }]}>Save changes</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  preview: {
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  avatarRow: {
    gap: 8,
    paddingVertical: 2,
  },
  avatarOption: {
    borderWidth: 3,
    borderRadius: 32,
    padding: 2,
  },
  check: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
