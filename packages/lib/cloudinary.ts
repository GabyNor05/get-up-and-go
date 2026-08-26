import { Cloudinary } from '@cloudinary/url-gen';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
require('dotenv').config()

export const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_NAME,
  },
  url: {
    secure: true,
  },
});

export const getAvatarUrl = (publicId: string, size = 150): string => {
  if (!publicId) return '';

  return cld
    .image(publicId)
    .delivery(format(auto()))
    .delivery(quality('auto'))
    .toURL();
};

export async function uploadImage(file: File, uploadPreset: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('gng_upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  return data.public_id; // Store this public_id in your database
}