import { Box } from '@mui/material';
import { CATEGORY_ICONS } from '../types/categoryIcons';

type CategoryIconProps = {
  category: keyof typeof CATEGORY_ICONS;
  size?: number;
  alt?: string;
};

export function CategoryIcon({ category, size = 48, alt }: CategoryIconProps) {
  const src = CATEGORY_ICONS[category];

  if (!src) return null;

  return (
    <Box
      component='img'
      src={src}
      alt={alt || `${category} icon`}
      sx={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}
