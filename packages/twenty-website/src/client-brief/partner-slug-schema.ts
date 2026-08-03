import { z } from 'zod';

// Mirrors the backend `slugify` output. Shared by the request schema and
// normalizePartnerSlug so the rule has one owner.
export const partnerSlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]+$/)
  .max(100);
