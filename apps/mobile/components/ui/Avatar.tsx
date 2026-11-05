import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { useAppTheme } from '@/hooks/useAppTheme';

interface AvatarProps {
  name: string;
  avatarPublicId?: string;
  size?: number;
}

export function cloudinaryAvatarUrl(publicId: string, size = 200): string {
  return `https://res.cloudinary.com/${process.env.EXPO_PUBLIC_CLOUDINARY_NAME}/image/upload/c_fill,g_auto,w_${size},h_${size},f_auto,q_auto/${publicId}`;
}

/** Goer avatar: their chosen Cloudinary image, or their initial */
export function Avatar({ name, avatarPublicId, size = 40 }: AvatarProps) {
  const { t } = useAppTheme();
  const box = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.base, box, { backgroundColor: t.fillBrandSubtle }]}>
      <Text style={[styles.initial, { color: t.textBrand, fontSize: size * 0.4 }]}>
        {name.charAt(0).toUpperCase() || 'G'}
      </Text>
      {avatarPublicId && process.env.EXPO_PUBLIC_CLOUDINARY_NAME ? (
        <Image
          source={{ uri: cloudinaryAvatarUrl(avatarPublicId, Math.round(size * 3)) }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    fontWeight: '700',
  },
});
