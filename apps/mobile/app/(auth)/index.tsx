import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';

import AppLogo from '@/assets/logo.png';
import { FormField } from '@/components/ui/FormField';
import { useAppTheme } from '@/hooks/useAppTheme';
import { friendlyAuthError } from '@/utils/authErrors';
import { authService } from '../../../../packages/firebase/src/services/authService';
import { fonts, radius } from '../../../../packages/shared-ui/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useAppTheme();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.login(email.trim(), password);
      router.replace('/(tabs)/(home)');
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: t.bgCanvas }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Image source={AppLogo} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.title, { color: t.textPrimary }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>Log in to see what's happening near you.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
          <FormField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <FormField
            ref={passwordRef}
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            rightSlot={
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={12}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} color={t.textSecondary} /> : <Eye size={20} color={t.textSecondary} />}
              </Pressable>
            }
          />

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: t.fillDangerSubtle }]}>
              <Text style={[styles.errorText, { color: t.danger }]}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={[styles.primary, { backgroundColor: t.actionPrimary, opacity: loading ? 0.7 : 1 }]}
          >
            {loading ? (
              <ActivityIndicator color={t.onActionPrimary} />
            ) : (
              <Text style={[styles.primaryText, { color: t.onActionPrimary }]}>Log in</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: t.textSecondary }]}>New to Get Up & Go?</Text>
          <Pressable onPress={() => router.push('/signup')} hitSlop={12}>
            <Text style={[styles.link, { color: t.textBrand }]}>Create an account</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/DevHappeningScreen')} style={styles.devLink}>
          <Text style={[styles.devText, { color: t.textSecondary }]}>Open dev tools</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 24,
  },
  brand: {
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  errorBox: {
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  primary: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 15,
  },
  link: {
    fontSize: 15,
    fontWeight: '700',
  },
  devLink: {
    alignSelf: 'center',
    padding: 8,
  },
  devText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
