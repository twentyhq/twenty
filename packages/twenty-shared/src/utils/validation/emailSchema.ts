import { z } from 'zod';

const EMAIL_REGEX =
  /^(?!\.)(?!.*\.\.)([\p{L}\p{N}_'+.-]{0,63})[\p{L}\p{N}_+-]@([\p{L}\p{N}][\p{L}\p{N}-]*\.)+[\p{L}]{2,}$/u;

export const emailSchema = z.email({ pattern: EMAIL_REGEX }).max(255);
