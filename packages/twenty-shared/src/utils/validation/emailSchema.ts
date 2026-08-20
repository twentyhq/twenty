import { z } from 'zod';

const EMAIL_REGEX =
  /^(?!\.)(?!.*\.\.)([\p{L}\p{N}_'+.-]{0,63})[\p{L}\p{N}_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/u;

export const emailSchema = z.email({ pattern: EMAIL_REGEX }).max(255);
