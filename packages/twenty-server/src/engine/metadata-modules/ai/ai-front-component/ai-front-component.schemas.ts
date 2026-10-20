import { z } from 'zod';
import { PageLayoutType } from 'twenty-shared/types';

export const frontComponentQuerySchema = z.object({
  objectName: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/),
  select: z
    .array(z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/))
    .min(1)
    .max(20),
  limit: z.number().int().min(1).max(100),
});

export const frontComponentDraftSchema = z.object({
  previousDraftId: z.string().uuid().optional(),
  pageLayoutType: z.enum([
    PageLayoutType.DASHBOARD,
    PageLayoutType.RECORD_PAGE,
  ]),
  name: z.string().trim().min(1).max(100),
  source: z.string().min(1).max(50000),
  query: frontComponentQuerySchema,
  sampleRecords: z.array(z.record(z.string(), z.unknown())).max(100),
});

export const frontComponentDraftIdSchema = z.object({
  draftId: z.string().uuid(),
});

export const frontComponentDiagnosticSchema = z.object({
  status: z.enum(['ready', 'error']),
  message: z.string().max(2000).optional(),
});

export type FrontComponentDraftInput = z.infer<
  typeof frontComponentDraftSchema
>;
export type FrontComponentQuery = z.infer<typeof frontComponentQuerySchema>;
export type FrontComponentDiagnostic = z.infer<
  typeof frontComponentDiagnosticSchema
>;

export type FrontComponentDraft = FrontComponentDraftInput & {
  id: string;
  rootId: string;
  expiresAt: number;
  threadId: string;
  userWorkspaceId: string;
  entrySource: string;
  componentName: string;
  compiledSource: string;
  checksum: string;
  diagnostic?: FrontComponentDiagnostic;
  publicationStarted?: boolean;
  publishedComponentId?: string;
};
