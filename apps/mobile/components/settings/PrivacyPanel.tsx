import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { KeyRound } from 'lucide-react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { auth, db } from '../../../../packages/firebase/src/config/firebase';
import { radius } from '../../../../packages/shared-ui/tokens';

interface PrivacyPanelProps {
  goerId: string;
  email: string | null;
}

export function PrivacyPanel({ goerId, email }: PrivacyPanelProps) {
  const { t } = useAppTheme();
  const [hideEmail, setHideEmail] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'goers', goerId))
      .then((snap) => setHideEmail(!!snap.data()?.permissions?.hide_email))
      .catch(() => {});
  }, [goerId]);

  const toggleHideEmail = async (value: boolean) => {
    setHideEmail(value);
    try {
      await setDoc(doc(db, 'goers', goerId), { permissions: { hide_email: value } }, { merge: true });
    } catch {
      setHideEmail(!value);
      Alert.alert("Couldn't save", 'Please try again.');
    }
  };

  const resetPassword = async () => {
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Check your inbox', `We sent a password reset link to ${email}.`);
    } catch {
      Alert.alert("Couldn't send the email", 'Please try again in a minute.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={[styles.rowTitle, { color: t.textPrimary }]}>Hide my email</Text>
          <Text style={[styles.caption, { color: t.textSecondary }]}>Circlees won't see your email on your profile</Text>
        </View>
        <Switch
          value={hideEmail}
          onValueChange={toggleHideEmail}
          trackColor={{ false: t.borderSubtle, true: t.actionPrimary }}
          thumbColor="#FAF8F0"
        />
      </View>

      <View style={[styles.note, { backgroundColor: t.bgElevated, borderColor: t.borderSubtle }]}>
        <Text style={[styles.rowTitle, { color: t.textPrimary }]}>Your location</Text>
        <Text style={[styles.caption, { color: t.textSecondary }]}>
          Only used on your phone to find nearby Happenings. It's never stored or shared with other Goers.
        </Text>
      </View>

      <Pressable onPress={resetPassword} style={[styles.button, { borderColor: t.borderStrong }]}>
        <KeyRound size={16} color={t.textPrimary} />
        <Text style={[styles.buttonText, { color: t.textPrimary }]}>Reset password</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  note: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
