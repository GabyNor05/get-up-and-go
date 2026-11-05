import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { Check, ChevronLeft, Minus, Plus, X } from 'lucide-react-native';

import { CIRCLE_EMOJIS, CIRCLE_THEMES } from '@/components/circles/circleThemes';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useGoer } from '@/hooks/useGoer';
import { circleService } from '../../../../../packages/firebase/src/services/circlesService';
import { goerService } from '../../../../../packages/firebase/src/services/goerService';
import { fonts, radius } from '../../../../../packages/shared-ui/tokens';

const MAX_TAGS = 4;
const MIN_SIZE = 2;
const MAX_SIZE = 50;

export default function NewCircleScreen() {
  const router = useRouter();
  const { t, isDark } = useAppTheme();
  const { goerId } = useGoer();

  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState(CIRCLE_EMOJIS[0]);
  const [themeIndex, setThemeIndex] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [maxSize, setMaxSize] = useState(20);
  const [saving, setSaving] = useState(false);

  const theme = CIRCLE_THEMES[themeIndex];
  const canCreate = title.trim().length > 0 && !saving;

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || tags.length >= MAX_TAGS || tags.includes(tag)) return;
    setTags((list) => [...list, tag]);
    setTagInput('');
  };

  const handleCreate = async () => {
    if (!goerId) {
      Alert.alert('Please log in', 'You need an account to start a Circle.');
      return;
    }
    if (!canCreate) return;
    setSaving(true);
    try {
      const circleId = await circleService.createCircle({
        title,
        emoji,
        accent: theme.accent,
        cardBg: { light: theme.light, dark: theme.dark },
        tags,
        maxSize,
        creatorGoerId: goerId,
      });
      await goerService.joinCircle(goerId, circleId);
      router.replace({ pathname: '/(tabs)/(circles)/[id]', params: { id: circleId } });
    } catch (err) {
      console.warn('Create Circle failed', err);
      Alert.alert("Couldn't create your Circle", 'Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [styles.input, { color: t.textPrimary, backgroundColor: t.bgElevated, borderColor: t.borderSubtle }];

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: t.bgCanvas }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Back"
            style={[styles.iconButton, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}
          >
            <ChevronLeft size={22} color={t.textPrimary} />
          </Pressable>
        </View>

        <Text style={[styles.title, { color: t.textPrimary }]}>New Circle</Text>

        {/* Live preview */}
        <View
          style={[styles.preview, { backgroundColor: isDark ? theme.dark : theme.light, borderColor: t.borderSubtle }]}
        >
          <View style={[styles.previewBlob, { backgroundColor: theme.accent }]} />
          <View style={[styles.emojiBadge, { backgroundColor: t.bgElevated }]}>
            <Text style={styles.emojiLarge}>{emoji}</Text>
          </View>
          <Text numberOfLines={1} style={[styles.previewTitle, { color: t.textPrimary }]}>
            {title.trim() || 'Your Circle'}
          </Text>
          <Text style={[styles.caption, { color: t.textSecondary }]}>Up to {maxSize} members</Text>
        </View>

        <Text style={[styles.label, { color: t.textPrimary }]}>Name</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Trail Crew"
          placeholderTextColor={t.textSecondary}
          maxLength={32}
          style={inputStyle}
        />

        <Text style={[styles.label, { color: t.textPrimary }]}>Icon</Text>
        <View style={styles.wrap}>
          {CIRCLE_EMOJIS.map((option) => {
            const selected = option === emoji;
            return (
              <Pressable
                key={option}
                onPress={() => setEmoji(option)}
                accessibilityLabel={`Icon ${option}`}
                style={[
                  styles.emojiOption,
                  { backgroundColor: selected ? t.fillBrandSubtle : t.bgSurface, borderColor: selected ? t.focusRing : t.borderSubtle },
                ]}
              >
                <Text style={styles.emoji}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: t.textPrimary }]}>Colour</Text>
        <View style={styles.wrap}>
          {CIRCLE_THEMES.map((option, index) => {
            const selected = index === themeIndex;
            return (
              <Pressable
                key={option.accent}
                onPress={() => setThemeIndex(index)}
                accessibilityLabel={`Colour ${index + 1}`}
                style={[styles.swatch, { backgroundColor: option.accent, borderColor: selected ? t.textPrimary : 'transparent' }]}
              >
                {selected ? <Check size={18} color="#24221B" /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: t.textPrimary }]}>Tags ({tags.length}/{MAX_TAGS})</Text>
        <View style={styles.tagRow}>
          <TextInput
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={addTag}
            placeholder="Hiking, Markets…"
            placeholderTextColor={t.textSecondary}
            returnKeyType="done"
            editable={tags.length < MAX_TAGS}
            style={[inputStyle, styles.flex]}
          />
          <Pressable
            onPress={addTag}
            accessibilityLabel="Add tag"
            style={[styles.squareButton, { backgroundColor: t.fillBrandSubtle }]}
          >
            <Plus size={20} color={t.textBrand} />
          </Pressable>
        </View>
        {tags.length > 0 ? (
          <View style={styles.wrap}>
            {tags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => setTags((list) => list.filter((item) => item !== tag))}
                accessibilityLabel={`Remove ${tag}`}
                style={[styles.tag, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}
              >
                <Text style={[styles.tagText, { color: t.textPrimary }]}>{tag}</Text>
                <X size={14} color={t.textSecondary} />
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={[styles.label, { color: t.textPrimary }]}>Max members</Text>
        <View style={[styles.stepper, { backgroundColor: t.bgSurface, borderColor: t.borderSubtle }]}>
          <Pressable
            onPress={() => setMaxSize((size) => Math.max(MIN_SIZE, size - 1))}
            accessibilityLabel="Fewer members"
            style={[styles.stepButton, { backgroundColor: t.fillBrandSubtle }]}
          >
            <Minus size={18} color={t.textBrand} />
          </Pressable>
          <Text style={[styles.stepValue, { color: t.textPrimary }]}>{maxSize}</Text>
          <Pressable
            onPress={() => setMaxSize((size) => Math.min(MAX_SIZE, size + 1))}
            accessibilityLabel="More members"
            style={[styles.stepButton, { backgroundColor: t.fillBrandSubtle }]}
          >
            <Plus size={18} color={t.textBrand} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: t.borderSubtle, backgroundColor: t.bgCanvas }]}>
        <Pressable
          onPress={handleCreate}
          disabled={!canCreate}
          style={[styles.primary, { backgroundColor: canCreate ? t.actionPrimary : t.borderSubtle }]}
        >
          {saving ? (
            <ActivityIndicator color={t.onActionPrimary} />
          ) : (
            <Text style={[styles.primaryText, { color: canCreate ? t.onActionPrimary : t.textSecondary }]}>
              Create Circle
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  topBar: {
    marginTop: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
    marginVertical: 8,
  },
  preview: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
    gap: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  previewBlob: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    right: -40,
    bottom: -60,
    opacity: 0.35,
  },
  emojiBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiLarge: {
    fontSize: 24,
  },
  previewTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  squareButton: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.pill,
    borderWidth: 1,
    padding: 6,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontFamily: fonts.display,
    fontSize: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  primary: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
