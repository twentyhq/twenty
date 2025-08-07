import { z } from 'zod';

import { MAIN_COLOR_NAMES, type ThemeColor } from '@ui/theme';

export const themeColorSchema = z.enum(
  MAIN_COLOR_NAMES as [ThemeColor, ...ThemeColor[]],
);
