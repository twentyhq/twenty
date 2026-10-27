import { z } from 'zod';

export const createObjectMetadataInputSchema = z.object({
  nameSingular: z.string().describe('Singular name (e.g. "company")'),
  namePlural: z.string().describe('Plural name (e.g. "companies")'),
  labelSingular: z.string().describe('Singular label (e.g. "Company")'),
  labelPlural: z.string().describe('Plural label (e.g. "Companies")'),
  description: z.string().optional().describe('Description'),
  icon: z
    .string()
    .optional()
    .describe(
      'Tabler icon name, PascalCase with "Icon" prefix (e.g. IconBuildingSkyscraper, IconPaw, IconTargetArrow). Always set one matching what the object represents.',
    ),
  shortcut: z.string().optional().describe('Keyboard shortcut'),
  isRemote: z.boolean().optional().describe('Remote object'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Sync label with name'),
});
