import { z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';

import { workflowStepManifestSchema } from '@/application/workflowStepManifestType';
import { getStepOutgoingStepIds } from '@/workflow/validation/utils/get-step-outgoing-step-ids.util';
import { buildWorkflowGraph } from '@/workflow/validation/utils/build-workflow-graph.util';
import { validateWorkflowGraph } from '@/workflow/validation/utils/validate-workflow-graph.util';

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

    const validatableWorkflow = {
      trigger,
      steps: steps.map((step) => ({
        ...step,
        id: step.universalIdentifier,
        settings: { input: step.input },
      })),
    };
    for (const issue of validateWorkflowGraph({
      workflow: validatableWorkflow,
      graph: buildWorkflowGraph(validatableWorkflow),
    })) {
      if (issue.severity === 'error')
        context.addIssue({ code: 'custom', message: issue.message });
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
      getStepOutgoingStepIds({
        ...step,
        id: step.universalIdentifier,
        settings: { input: step.input },
      }).forEach(visit);
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

export type WorkflowManifest = z.input<typeof workflowManifestSchema>;
