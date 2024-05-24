import { z } from 'zod';

import { MAIN_COLOR_NAMES, ThemeColor } from '@ui/theme';

export const themeColorSchema = z.enum(
  MAIN_COLOR_NAMES as [ThemeColor, ...ThemeColor[]],
);
