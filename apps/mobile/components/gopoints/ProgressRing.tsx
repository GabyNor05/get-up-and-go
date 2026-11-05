import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts } from '../../../../packages/shared-ui/tokens';

interface ProgressRingProps {
  /** 0–1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  caption?: string;
}

/** Celery progress ring (progress colour is reserved for GP / levels) */
export function ProgressRing({ progress, size = 88, strokeWidth = 8, label, caption }: ProgressRingProps) {
  const { t } = useAppTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} fill="none" stroke={t.fillProgressSubtle} strokeWidth={strokeWidth} />
        <G rotation={-90} origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={t.actionSecondary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </G>
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.label, { color: t.textPrimary, fontSize: size * 0.24 }]}>{label}</Text>
        {caption ? <Text style={[styles.caption, { color: t.textSecondary }]}>{caption}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.display,
  },
  caption: {
    fontSize: 12,
    marginTop: 1,
  },
});
