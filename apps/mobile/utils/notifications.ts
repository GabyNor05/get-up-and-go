/**
 * Local Happening reminders.
 *
 * These are LOCAL notifications scheduled on the phone, so they work in the
 * installed APK without a push server or Firebase Cloud Messaging. Remote
 * push (server-sent) is a later feature: since SDK 53 it doesn't work in
 * Expo Go and would need FCM credentials + a backend to send pushes.
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const PREFS_KEY = 'gng.reminderPrefs';
const CHANNEL_ID = 'happening-reminders';

export interface ReminderPrefs {
  enabled: boolean;
  /** Minutes before a Happening starts */
  leadMinutes: number;
}

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = { enabled: true, leadMinutes: 60 };
export const LEAD_OPTIONS = [30, 60, 180];

let configured = false;

/** Call once at app start: show reminders even when the app is open */
export function configureNotifications(): void {
  if (configured) return;
  configured = true;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Happening reminders',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#A88AED',
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Notifications unavailable', err);
  }
}

export async function getReminderPrefs(): Promise<ReminderPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_REMINDER_PREFS, ...(JSON.parse(raw) as Partial<ReminderPrefs>) } : DEFAULT_REMINDER_PREFS;
  } catch {
    return DEFAULT_REMINDER_PREFS;
  }
}

export async function saveReminderPrefs(prefs: ReminderPrefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

/** Asks for permission if needed. Returns true when reminders can be shown. */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (err) {
    console.warn('Notification permission failed', err);
    return false;
  }
}

const reminderId = (happeningId: string) => `happening-${happeningId}`;

/**
 * Schedules "starts soon" for an RSVP'd Happening.
 * Returns false when reminders are off, permission is denied or it's too late.
 */
export async function scheduleHappeningReminder(happening: {
  id: string;
  title: string;
  locationName?: string;
  startsAt: Date;
}): Promise<boolean> {
  try {
    const prefs = await getReminderPrefs();
    if (!prefs.enabled) return false;

    const fireAt = new Date(happening.startsAt.getTime() - prefs.leadMinutes * 60_000);
    if (fireAt.getTime() <= Date.now() + 5_000) return false;
    if (!(await ensureNotificationPermission())) return false;

    await Notifications.cancelScheduledNotificationAsync(reminderId(happening.id)).catch(() => {});
    const lead = prefs.leadMinutes >= 60 ? `${prefs.leadMinutes / 60}h` : `${prefs.leadMinutes} min`;
    await Notifications.scheduleNotificationAsync({
      identifier: reminderId(happening.id),
      content: {
        title: `${happening.title} starts in ${lead}`,
        body: happening.locationName ? `Head to ${happening.locationName} and check in for +50 GP.` : 'Check in for +50 GP.',
        data: { happeningId: happening.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
        channelId: CHANNEL_ID,
      },
    });
    return true;
  } catch (err) {
    console.warn('Could not schedule reminder', err);
    return false;
  }
}

export async function cancelHappeningReminder(happeningId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(reminderId(happeningId));
  } catch {
    /* nothing scheduled */
  }
}

/** Sends a reminder 5 seconds from now so you can check notifications work on this phone */
export async function sendTestNotification(): Promise<boolean> {
  try {
    if (!(await ensureNotificationPermission())) return false;
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Get Up & Go reminders are on', body: "We'll nudge you before Happenings you RSVP to." },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: CHANNEL_ID },
    });
    return true;
  } catch (err) {
    console.warn('Test notification failed', err);
    return false;
  }
}
