import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts, typeScale } from '../../../packages/shared-ui/tokens';

interface HeaderProps {
  pageHeader: string;
  subHeading: string;
}

export function Header({ pageHeader, subHeading }: HeaderProps) {
  const { t } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: t.textBrand }]}>{pageHeader}</Text>
      <Text style={[styles.subtitle, { color: t.textSecondary }]}>{subHeading}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 16,
  },
  title: {
    fontFamily: fonts.display,
    ...typeScale.displayLg,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontWeight: '500',
    ...typeScale.body,
  },
});
