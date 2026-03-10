import { z } from 'zod';

import { type ThemeColor, MAIN_COLOR_NAMES } from '@ui/theme';

export const themeColorSchema = z.enum(
  MAIN_COLOR_NAMES as [ThemeColor, ...ThemeColor[]],
);
