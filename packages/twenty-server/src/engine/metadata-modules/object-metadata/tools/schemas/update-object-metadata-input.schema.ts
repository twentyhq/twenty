import { z } from 'zod';

export const updateObjectMetadataInputSchema = z.object({
  id: z.uuid().describe('Object ID'),
  labelSingular: z.string().optional().describe('Singular label'),
  labelPlural: z.string().optional().describe('Plural label'),
  nameSingular: z.string().optional().describe('Singular name'),
  namePlural: z.string().optional().describe('Plural name'),
  description: z.string().optional().describe('Description'),
  icon: z
    .string()
    .optional()
    .describe('Tabler icon name (e.g. IconBuildingSkyscraper)'),
  shortcut: z.string().optional().describe('Keyboard shortcut'),
  isActive: z.boolean().optional().describe('Active state'),
  labelIdentifierFieldMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe('Label identifier field ID'),
  imageIdentifierFieldMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe('Image identifier field ID'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Sync label with name'),
});
