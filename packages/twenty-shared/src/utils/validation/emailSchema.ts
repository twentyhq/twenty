import { z } from 'zod';

export const EMAIL_REGEX =
  /^(?!\.)(?!.*\.\.)([\p{L}\p{N}_'+.-]{0,63})[\p{L}\p{N}_+-]@(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+[\p{L}][\p{L}\p{N}-]*[\p{L}\p{N}]$/u;

export const emailSchema = z.email({ pattern: EMAIL_REGEX }).max(255);
