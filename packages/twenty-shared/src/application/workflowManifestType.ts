import { z } from 'zod';

import { validateWorkflowVariableReferences } from '@/workflow/validation/utils/validate-workflow-variable-references.util';

import { workflowStepManifestSchema } from '@/application/workflowStepManifestType';
import { buildWorkflowGraph } from '@/workflow/validation/utils/build-workflow-graph.util';
import { validateWorkflowExecutionPaths } from '@/workflow/validation/utils/validate-workflow-execution-paths.util';
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
    const graph = buildWorkflowGraph(validatableWorkflow);
    for (const issue of [
      ...validateWorkflowGraph({
        workflow: validatableWorkflow,
        graph,
      }),
      ...validateWorkflowExecutionPaths({
        workflow: validatableWorkflow,
        graph,
      }),
      ...validateWorkflowVariableReferences({
        workflow: validatableWorkflow,
        graph,
        stepsById: new Map(
          validatableWorkflow.steps.map((step) => [step.id, step]),
        ),
      }),
    ]) {
      if (issue.severity === 'error') {
        context.addIssue({ code: 'custom', message: issue.message });
      }
    }
  });

export type WorkflowManifest = z.input<typeof workflowManifestSchema>;
