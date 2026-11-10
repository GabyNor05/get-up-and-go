import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { ChevronDown, ChevronUp, Mail } from 'lucide-react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { radius } from '../../../../packages/shared-ui/tokens';

const SUPPORT_EMAIL = 'hello@getupandgo.app';

const FAQS = [
  {
    q: 'What is a Happening?',
    a: 'Anything worth getting out for: markets, live music, trail runs, tastings and meet-ups near you. Venues and organisers list them on the Get Up & Go partner portal.',
  },
  {
    q: 'How do I earn Go-Points?',
    a: 'Open a Happening, tap Check in when you get there and scan the venue QR code. Each check-in earns 50 GP, once per Happening. GP add up to new levels.',
  },
  {
    q: 'What are Circles?',
    a: 'Small groups of friends who keep each other going. Start one, share its code, and see what your Circle is doing. Tap Me Too to join a friend at the same Happening.',
  },
  {
    q: 'How do I join a friend\'s Circle?',
    a: 'Ask them for their Circle code (it looks like GRLZ-4TQ), then go to Circles → Join Circle and type it in.',
  },
  {
    q: 'Why does the app need my location?',
    a: 'Only to show Happenings near you and work out distances. Your location is never shared with other Goers.',
  },
  {
    q: 'I\'m not getting reminders',
    a: 'Check Settings → Preferences → Happening reminders is on and that notifications are allowed for Get Up & Go in your phone settings. Reminders only work in the installed app, not Expo Go.',
  },
];

export function HelpPanel() {
  const { t } = useAppTheme();
  const [open, setOpen] = useState<number | null>(0);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={styles.wrapper}>
      {FAQS.map((item, index) => {
        const expanded = open === index;
        return (
          <View key={item.q} style={[styles.item, { backgroundColor: t.bgElevated, borderColor: t.borderSubtle }]}>
            <Pressable
              onPress={() => setOpen(expanded ? null : index)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              style={styles.question}
            >
              <Text style={[styles.questionText, { color: t.textPrimary }]}>{item.q}</Text>
              {expanded ? <ChevronUp size={18} color={t.textSecondary} /> : <ChevronDown size={18} color={t.textSecondary} />}
            </Pressable>
            {expanded ? <Text style={[styles.answer, { color: t.textSecondary }]}>{item.a}</Text> : null}
          </View>
        );
      })}

      <Pressable
        onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Get%20Up%20%26%20Go%20support`).catch(() => {})}
        style={[styles.contact, { backgroundColor: t.fillBrandSubtle }]}
      >
        <Mail size={18} color={t.textBrand} />
        <View style={styles.flex}>
          <Text style={[styles.contactTitle, { color: t.textBrand }]}>Still stuck? Email us</Text>
          <Text style={[styles.caption, { color: t.textBrand }]}>{SUPPORT_EMAIL}</Text>
        </View>
      </Pressable>

      <Text style={[styles.caption, styles.center, { color: t.textSecondary }]}>
        Get Up & Go v{version} · Made in Gauteng
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  item: {
    borderRadius: radius.md,
    borderWidth: 1,
  },
  question: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  answer: {
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    marginTop: 6,
  },
  flex: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  center: {
    textAlign: 'center',
    marginTop: 8,
  },
});
