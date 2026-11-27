import { z } from 'zod';

import { MAIN_COLOR_NAMES } from '@ui/theme';

// Lets bundlers drop zod when the shared utilities chunk is imported without this schema.
export const themeColorSchema = /* @__PURE__ */ z.enum(MAIN_COLOR_NAMES);
