import { PARTNER_PATTERN } from 'twenty-shared/constants';
import { z } from 'zod';

// Same rule as normalizePartner from twenty-shared/utils. Importing it would
// add its ~200 KB gzipped chunk (temporal-polyfill, libphonenumber, ...) to
// every page.
export const partnerSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(PARTNER_PATTERN);
