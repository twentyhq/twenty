import { z } from 'zod';

import { MAIN_COLOR_NAMES } from '@ui/theme';

export const themeColorSchema = z.enum(MAIN_COLOR_NAMES);
