import { z } from 'zod';

export const aiProviderAuthTypeSchema = z.enum(['key', 'credentials', 'role']);
