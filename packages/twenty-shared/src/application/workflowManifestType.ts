import { z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';

const workflowStepManifestSchema = z.strictObject({
  universalIdentifier: z.uuid(),
  name: z.string().min(1),
  type: z.literal('LOGIC_FUNCTION'),
  logicFunctionUniversalIdentifier: z.uuid(),
  input: z.record(z.string(), z.unknown()),
  nextStepIds: z.array(z.uuid()),
});

export const workflowManifestSchema = z
  .strictObject({
    universalIdentifier: z.uuid(),
    name: z.string().min(1),
    version: z.strictObject({
      universalIdentifier: z.uuid(),
      trigger: z.strictObject({
        universalIdentifier: z.uuid(),
        type: z.literal('MANUAL'),
        nextStepIds: z.array(z.uuid()).min(1),
      }),
      steps: z.array(workflowStepManifestSchema).min(1),
    }),
  })
  .superRefine((workflow, context) => {
    const { steps, trigger } = workflow.version;
    const identities = [
      workflow.universalIdentifier,
      workflow.version.universalIdentifier,
      trigger.universalIdentifier,
      ...steps.map((step) => step.universalIdentifier),
    ];

    if (new Set(identities).size !== identities.length) {
      context.addIssue({
        code: 'custom',
        message:
          'Workflow, version, trigger and steps must have distinct universal identifiers',
      });
    }

    const stepsById = new Map(
      steps.map((step) => [step.universalIdentifier, step]),
    );
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string): void => {
      if (visiting.has(id)) {
        context.addIssue({
          code: 'custom',
          message: `Workflow contains a cycle at step ${id}`,
        });
        return;
      }
      if (visited.has(id)) {
        return;
      }
      const step = stepsById.get(id);
      if (!isDefined(step)) {
        context.addIssue({
          code: 'custom',
          message: `Workflow references missing step ${id}`,
        });
        return;
      }
      visiting.add(id);
      step.nextStepIds.forEach(visit);
      visiting.delete(id);
      visited.add(id);
    };
    trigger.nextStepIds.forEach(visit);
    if (visited.size !== steps.length) {
      context.addIssue({
        code: 'custom',
        message: 'Every workflow step must be reachable from its trigger',
      });
    }
  });

export type WorkflowManifest = z.infer<typeof workflowManifestSchema>;
