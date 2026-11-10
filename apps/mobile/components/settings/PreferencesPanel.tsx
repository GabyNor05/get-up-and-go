import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { BellRing } from 'lucide-react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemePreference } from '@/components/theme/ThemeProvider';
import {
  DEFAULT_REMINDER_PREFS,
  LEAD_OPTIONS,
  ensureNotificationPermission,
  getReminderPrefs,
  saveReminderPrefs,
  sendTestNotification,
  type ReminderPrefs,
} from '@/utils/notifications';
import { radius } from '../../../../packages/shared-ui/tokens';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function leadLabel(minutes: number): string {
  return minutes >= 60 ? `${minutes / 60}h before` : `${minutes} min before`;
}

export function PreferencesPanel() {
  const { t, preference, setPreference } = useAppTheme();
  const [prefs, setPrefs] = useState<ReminderPrefs>(DEFAULT_REMINDER_PREFS);

  useEffect(() => {
    getReminderPrefs().then(setPrefs);
  }, []);

  const update = async (next: ReminderPrefs) => {
    setPrefs(next);
    await saveReminderPrefs(next).catch(() => {});
  };

  const toggleReminders = async (enabled: boolean) => {
    if (enabled && !(await ensureNotificationPermission())) {
      Alert.alert('Notifications are off', 'Allow notifications for Get Up & Go in your phone settings to get reminders.');
      return;
    }
    update({ ...prefs, enabled });
  };

  const testReminder = async () => {
    const ok = await sendTestNotification();
    Alert.alert(
      ok ? 'Test reminder on its way' : "Couldn't send a reminder",
      ok ? 'You should see it in about 5 seconds.' : 'Allow notifications in your phone settings, and use the installed app (not Expo Go).',
    );
  };

  const chip = (selected: boolean) => [
    styles.chip,
    { backgroundColor: selected ? t.actionPrimary : t.bgElevated, borderColor: selected ? t.actionPrimary : t.borderSubtle },
  ];
  const chipText = (selected: boolean) => [styles.chipText, { color: selected ? t.onActionPrimary : t.textPrimary }];

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.section, { color: t.textPrimary }]}>Appearance</Text>
      <View style={styles.chips}>
        {THEME_OPTIONS.map((option) => (
          <Pressable key={option.value} onPress={() => setPreference(option.value)} style={chip(preference === option.value)}>
            <Text style={chipText(preference === option.value)}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.section, { color: t.textPrimary }]}>Notifications</Text>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={[styles.rowTitle, { color: t.textPrimary }]}>Happening reminders</Text>
          <Text style={[styles.caption, { color: t.textSecondary }]}>A nudge before Happenings you RSVP to</Text>
        </View>
        <Switch
          value={prefs.enabled}
          onValueChange={toggleReminders}
          trackColor={{ false: t.borderSubtle, true: t.actionPrimary }}
          thumbColor="#FAF8F0"
        />
      </View>

      {prefs.enabled ? (
        <>
          <Text style={[styles.caption, { color: t.textSecondary }]}>Remind me</Text>
          <View style={styles.chips}>
            {LEAD_OPTIONS.map((minutes) => (
              <Pressable key={minutes} onPress={() => update({ ...prefs, leadMinutes: minutes })} style={chip(prefs.leadMinutes === minutes)}>
                <Text style={chipText(prefs.leadMinutes === minutes)}>{leadLabel(minutes)}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={testReminder} style={[styles.testButton, { borderColor: t.borderStrong }]}>
            <BellRing size={16} color={t.textPrimary} />
            <Text style={[styles.testText, { color: t.textPrimary }]}>Send a test reminder</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  section: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
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
    lineHeight: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  testText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
