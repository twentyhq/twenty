import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { z } from 'zod';

export const pageLayoutTabLayoutModeSchema = z.enum(
  Object.values(PageLayoutTabLayoutMode) as [string, ...string[]],
);
