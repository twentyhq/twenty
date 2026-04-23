import { z } from 'zod';

export const aiProviderAuthTypeSchema = z.enum(['key', 'credentials', 'role']);

export type AiProviderAuthType = z.infer<typeof aiProviderAuthTypeSchema>;
