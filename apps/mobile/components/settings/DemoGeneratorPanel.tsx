import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { LocateFixed, Minus, Plus, Trash2, Wand2 } from 'lucide-react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import {
  DEMO_AREAS,
  buildDemoHappenings,
  clearDemoHappenings,
  generateDemoHappenings,
} from '../../../../packages/firebase/src/demo/demoHappenings';
import { radius } from '../../../../packages/shared-ui/tokens';

interface Center {
  label: string;
  latitude: number;
  longitude: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDay(d: Date): string {
  return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Admin-only: fill an area with realistic demo Happenings for a date range */
export function DemoGeneratorPanel() {
  const { t } = useAppTheme();
  const [center, setCenter] = useState<Center>(DEMO_AREAS[0]);
  const [startDate, setStartDate] = useState(startOfToday);
  const [days, setDays] = useState(4);
  const [radiusKm, setRadiusKm] = useState(15);
  const [busy, setBusy] = useState<'generate' | 'clear' | 'locate' | null>(null);

  const endDate = new Date(startDate.getTime() + (days - 1) * DAY_MS);
  const previewCount = useMemo(
    () => buildDemoHappenings({ center, radiusKm, startDate, days }).length,
    [center, radiusKm, startDate, days],
  );

  const useMyLocation = async () => {
    setBusy('locate');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location is off', 'Allow location to use where you are now.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setCenter({ label: 'My location', latitude: position.coords.latitude, longitude: position.coords.longitude });
    } catch {
      Alert.alert("Couldn't get your location", 'Pick one of the areas instead.');
    } finally {
      setBusy(null);
    }
  };

  const generate = async () => {
    setBusy('generate');
    try {
      const count = await generateDemoHappenings({ center, radiusKm, startDate, days });
      Alert.alert('Happenings added', `${count} demo Happenings from ${formatDay(startDate)} to ${formatDay(endDate)}.`);
    } catch (err) {
      console.warn('Demo generation failed', err);
      Alert.alert("Couldn't add Happenings", 'Check your connection and Firestore rules.');
    } finally {
      setBusy(null);
    }
  };

  const clear = () => {
    Alert.alert('Remove all demo Happenings?', 'Real Happenings from partners are not affected.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setBusy('clear');
          try {
            const removed = await clearDemoHappenings();
            Alert.alert('Done', `Removed ${removed} demo Happenings.`);
          } catch {
            Alert.alert("Couldn't remove them", 'Please try again.');
          } finally {
            setBusy(null);
          }
        },
      },
    ]);
  };

  const chip = (selected: boolean) => [
    styles.chip,
    { backgroundColor: selected ? t.actionPrimary : t.bgElevated, borderColor: selected ? t.actionPrimary : t.borderSubtle },
  ];
  const chipText = (selected: boolean) => [styles.chipText, { color: selected ? t.onActionPrimary : t.textPrimary }];

  const Stepper = ({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) => (
    <View style={[styles.stepper, { backgroundColor: t.bgElevated, borderColor: t.borderSubtle }]}>
      <Pressable onPress={onMinus} accessibilityLabel={`Less ${label}`} style={[styles.stepButton, { backgroundColor: t.fillBrandSubtle }]}>
        <Minus size={16} color={t.textBrand} />
      </Pressable>
      <View style={styles.stepCenter}>
        <Text style={[styles.caption, { color: t.textSecondary }]}>{label}</Text>
        <Text style={[styles.stepValue, { color: t.textPrimary }]}>{value}</Text>
      </View>
      <Pressable onPress={onPlus} accessibilityLabel={`More ${label}`} style={[styles.stepButton, { backgroundColor: t.fillBrandSubtle }]}>
        <Plus size={16} color={t.textBrand} />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.body, { color: t.textSecondary }]}>
        Fills the app with made-up Happenings at real venues (Irene Farm, Cappuccino's Southdowns, Big Red Barn…).
        Re-running refreshes them instead of duplicating.
      </Text>

      <Text style={[styles.label, { color: t.textPrimary }]}>Area</Text>
      <View style={styles.chips}>
        {DEMO_AREAS.map((area) => (
          <Pressable key={area.key} onPress={() => setCenter(area)} style={chip(center.label === area.label)}>
            <Text style={chipText(center.label === area.label)}>{area.label}</Text>
          </Pressable>
        ))}
        <Pressable onPress={useMyLocation} style={chip(center.label === 'My location')}>
          {busy === 'locate' ? (
            <ActivityIndicator size="small" color={t.textBrand} />
          ) : (
            <View style={styles.inline}>
              <LocateFixed size={14} color={center.label === 'My location' ? t.onActionPrimary : t.textPrimary} />
              <Text style={chipText(center.label === 'My location')}>My location</Text>
            </View>
          )}
        </Pressable>
      </View>

      <Stepper
        label="Starts"
        value={formatDay(startDate)}
        onMinus={() => setStartDate((d) => (d.getTime() > startOfToday().getTime() ? new Date(d.getTime() - DAY_MS) : d))}
        onPlus={() => setStartDate((d) => new Date(d.getTime() + DAY_MS))}
      />
      <Stepper
        label="Days"
        value={`${days} (to ${formatDay(endDate)})`}
        onMinus={() => setDays((n) => Math.max(1, n - 1))}
        onPlus={() => setDays((n) => Math.min(14, n + 1))}
      />
      <Stepper
        label="Radius"
        value={`${radiusKm} km`}
        onMinus={() => setRadiusKm((n) => Math.max(2, n - 1))}
        onPlus={() => setRadiusKm((n) => Math.min(40, n + 1))}
      />

      <Pressable
        onPress={generate}
        disabled={busy !== null || previewCount === 0}
        style={[styles.primary, { backgroundColor: previewCount ? t.actionPrimary : t.borderSubtle }]}
      >
        {busy === 'generate' ? (
          <ActivityIndicator color={t.onActionPrimary} />
        ) : (
          <>
            <Wand2 size={18} color={previewCount ? t.onActionPrimary : t.textSecondary} />
            <Text style={[styles.primaryText, { color: previewCount ? t.onActionPrimary : t.textSecondary }]}>
              {previewCount ? `Add ${previewCount} Happenings` : 'No venues in range'}
            </Text>
          </>
        )}
      </Pressable>

      <Pressable onPress={clear} disabled={busy !== null} style={[styles.secondary, { borderColor: t.danger }]}>
        {busy === 'clear' ? (
          <ActivityIndicator color={t.danger} />
        ) : (
          <>
            <Trash2 size={16} color={t.danger} />
            <Text style={[styles.secondaryText, { color: t.danger }]}>Remove all demo Happenings</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    padding: 6,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCenter: {
    flex: 1,
    alignItems: 'center',
  },
  stepValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
