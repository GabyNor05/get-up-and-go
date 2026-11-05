import { useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';

import { FormField } from '@/components/ui/FormField';
import { AVATAR_PUBLIC_IDS } from '@/constants/avatars';
import { useAppTheme } from '@/hooks/useAppTheme';
import { friendlyAuthError } from '@/utils/authErrors';
import { authService } from '../../../../packages/firebase/src/services/authService';
import { fonts, radius } from '../../../../packages/shared-ui/tokens';

const MIN_PASSWORD = 6;

function cloudinaryAvatarUrl(publicId: string): string {
  return `https://res.cloudinary.com/${process.env.EXPO_PUBLIC_CLOUDINARY_NAME}/image/upload/c_fill,g_auto,w_200,h_200,f_auto,q_auto/${publicId}`;
}

type FieldErrors = Partial<Record<'avatar' | 'username' | 'email' | 'password' | 'confirm', string>>;

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useAppTheme();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!selectedAvatar) next.avatar = 'Pick an avatar.';
    if (!username.trim()) next.username = 'Choose a username.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email.';
    if (password.length < MIN_PASSWORD) next.password = `At least ${MIN_PASSWORD} characters.`;
    if (confirm !== password) next.confirm = "Passwords don't match.";
    return next;
  };

  const handleSignUp = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    setEmailTaken(false);
    if (Object.keys(nextErrors).length > 0 || !selectedAvatar) return;

    setLoading(true);
    try {
      await authService.signUp({
        email: email.trim(),
        password,
        username: username.trim(),
        role: 'goer',
        avatarPublicId: selectedAvatar,
      });
      router.replace('/onboarding');
    } catch (err) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: unknown }).code) : '';
      setEmailTaken(code === 'auth/email-already-in-use');
      setFormError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => (router.canGoBack() ? router.back() : router.replace('/(auth)'));

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: t.bgCanvas }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={goToLogin}
          accessibilityLabel="Back to log in"
          style={[styles.iconButton, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}
        >
          <ChevronLeft size={22} color={t.textPrimary} />
        </Pressable>

        <View style={styles.heading}>
          <Text style={[styles.title, { color: t.textPrimary }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>Start exploring what's around you.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
          {/* Avatar picker */}
          <View style={styles.avatarSection}>
            <Text style={[styles.label, { color: t.textPrimary }]}>Choose your avatar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
              {AVATAR_PUBLIC_IDS.map((id) => {
                const selected = selectedAvatar === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => setSelectedAvatar(id)}
                    accessibilityLabel="Avatar option"
                    accessibilityState={{ selected }}
                    style={[
                      styles.avatar,
                      { borderColor: selected ? t.focusRing : t.borderSubtle, borderWidth: selected ? 3 : 1.5, backgroundColor: t.fillBrandSubtle },
                    ]}
                  >
                    <Image
                      source={{ uri: cloudinaryAvatarUrl(id) }}
                      style={styles.avatarImage}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                    {selected ? (
                      <View style={[styles.avatarCheck, { backgroundColor: t.actionPrimary, borderColor: t.bgSurface }]}>
                        <Check size={12} color={t.onActionPrimary} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            {errors.avatar ? <Text style={[styles.inlineError, { color: t.danger }]}>{errors.avatar}</Text> : null}
          </View>

          <FormField
            label="Username"
            placeholder="choose_a_username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            error={errors.username}
          />
          <FormField
            ref={emailRef}
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
            error={errors.email}
          />
          <FormField
            ref={passwordRef}
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            error={errors.password}
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
          <FormField
            ref={confirmRef}
            label="Confirm password"
            placeholder="Repeat your password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
            error={errors.confirm}
          />

          {formError ? (
            <View style={[styles.errorBox, { backgroundColor: t.fillDangerSubtle }]}>
              <Text style={[styles.errorText, { color: t.danger }]}>{formError}</Text>
              {emailTaken ? (
                <Pressable onPress={goToLogin} hitSlop={8}>
                  <Text style={[styles.errorLink, { color: t.danger }]}>Go to log in</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <Pressable
            onPress={handleSignUp}
            disabled={loading}
            style={[styles.primary, { backgroundColor: t.actionPrimary, opacity: loading ? 0.7 : 1 }]}
          >
            {loading ? (
              <ActivityIndicator color={t.onActionPrimary} />
            ) : (
              <Text style={[styles.primaryText, { color: t.onActionPrimary }]}>Create account</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: t.textSecondary }]}>Already have an account?</Text>
          <Pressable onPress={goToLogin} hitSlop={12}>
            <Text style={[styles.link, { color: t.textBrand }]}>Log in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    gap: 6,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  avatarSection: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  avatarRow: {
    gap: 12,
    paddingVertical: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineError: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  errorLink: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
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
});
