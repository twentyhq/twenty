import { PARTNER_PATTERN } from 'twenty-shared/constants';
import { z } from 'zod';

export const partnerSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(PARTNER_PATTERN);
