import { z } from 'zod';

const manualTriggerAvailabilityManifestSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('GLOBAL') }),
  z.strictObject({
    type: z.literal('SINGLE_RECORD'),
    objectUniversalIdentifier: z.uuid(),
  }),
  z.strictObject({
    type: z.literal('BULK_RECORDS'),
    objectUniversalIdentifier: z.uuid(),
  }),
]);

const workflowTriggerManifestOptions = [
  z.strictObject({
    universalIdentifier: z.uuid(),
    type: z.literal('MANUAL'),
    nextStepIds: z.array(z.uuid()).min(1),
    settings: z
      .strictObject({
        availability: manualTriggerAvailabilityManifestSchema.optional(),
        icon: z.string().optional(),
        isPinned: z.boolean().optional(),
      })
      .optional(),
  }),
] as const;

const WORKFLOW_TRIGGER_MANIFEST_TYPES = workflowTriggerManifestOptions.map(
  (option) => option.shape.type.value,
);

export const workflowTriggerManifestSchema = z.discriminatedUnion(
  'type',
  workflowTriggerManifestOptions,
  {
    error: (issue) =>
      issue.code === 'invalid_union'
        ? `Unsupported trigger type. Application workflows support: ${WORKFLOW_TRIGGER_MANIFEST_TYPES.join(', ')}`
        : undefined,
  },
);

export type WorkflowTriggerManifest = z.infer<
  typeof workflowTriggerManifestSchema
>;
