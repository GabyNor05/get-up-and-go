import { forwardRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { radius } from '../../../../packages/shared-ui/tokens';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  rightSlot?: ReactNode;
}

/** Labelled text input with focus ring and inline error (design-system FormField) */
export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField(
  { label, error, rightSlot, onFocus, onBlur, style, ...inputProps },
  ref,
) {
  const { t } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? t.danger : focused ? t.focusRing : t.borderSubtle;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: t.textPrimary }]}>{label}</Text>
      <View style={[styles.field, { backgroundColor: t.bgElevated, borderColor }]}>
        <TextInput
          ref={ref}
          placeholderTextColor={t.textSecondary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: t.textPrimary }, style]}
          {...inputProps}
        />
        {rightSlot ? <View style={styles.slot}>{rightSlot}</View> : null}
      </View>
      {error ? <Text style={[styles.error, { color: t.danger }]}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  slot: {
    paddingRight: 14,
  },
  error: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
