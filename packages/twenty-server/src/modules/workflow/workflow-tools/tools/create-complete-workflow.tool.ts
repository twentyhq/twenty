import { isDefined } from 'twenty-shared/utils';
import {
  WORKFLOW_ACTION_FEATURE_FLAGS,
  workflowActionSchema,
  WorkflowActionType,
  workflowTriggerSchema,
} from 'twenty-shared/workflow';
import { z } from 'zod';

import { type CreatedCoreWorkflow } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type WorkflowVersionEdge } from 'src/modules/workflow/workflow-builder/utils/assemble-workflow-version-content.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { workflowStepConnectionOptionsSchema } from 'src/modules/workflow/workflow-tools/tools/schemas/workflow-step-connection-options.schema';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const createCompleteWorkflowSchema = z.object({
  name: z.string().describe('The name of the workflow'),
  description: z
    .string()
    .optional()
    .describe('Optional description of the workflow'),
  trigger: workflowTriggerSchema,
  steps: z
    .array(workflowActionSchema)
    .describe('Array of workflow action steps'),
  edges: z
    .array(
      z.object({
        source: z
          .string()
          .describe(
            'The ID of the source step (use "trigger" for trigger step)',
          ),
        target: z.string().describe('The ID of the target step'),
        sourceConnectionOptions: workflowStepConnectionOptionsSchema.optional(),
      }),
    )
    .optional()
    .describe('Optional array of connections between steps'),
  activate: z
    .boolean()
    .optional()
    .describe('Whether to activate the workflow immediately (default: false)'),
});

type CreateCompleteWorkflowToolDeps = Pick<
  WorkflowToolDependencies,
  'coreWorkflowMutationService' | 'coreWorkflowLifecycleService'
>;

type CreateCompleteWorkflowFailure = {
  success: false;
  message: string;
  error: string;
};

export const createCreateCompleteWorkflowTool = (
  deps: CreateCompleteWorkflowToolDeps,
  context: WorkflowToolContext,
) => ({
  name: 'create_complete_workflow' as const,
  description: `Create a complete workflow with trigger, steps, and connections in a single operation.

CRITICAL SCHEMA REQUIREMENTS:
- Trigger type MUST be one of: DATABASE_EVENT, MANUAL, CRON, WEBHOOK
- NEVER use "RECORD_CREATED" - this is invalid. Use "DATABASE_EVENT" instead.
- Each step MUST include: id (must be a valid UUID), name, type, valid, settings
- CREATE_RECORD actions MUST have objectName and objectRecord in settings.input
- objectRecord must contain actual field values, not just field names
- RICH_TEXT fields (e.g. a note/task "body") MUST be an object, not a string: { "markdown": "your text, may contain {{variables}}" }. A bare string is rejected.
- Use "trigger" as the id for the trigger step in edges
- Step positions are computed automatically; do not provide coordinates
- settings.outputSchema can be {}: Twenty computes it for ITERATOR steps and derives it for record, form and trigger steps. For HTTP_REQUEST steps, set settings.expectedOutputSchema to an example response so later steps can reference its fields

ITERATOR steps (loops):
- An edge leaving an ITERATOR only enters the loop body when it carries sourceConnectionOptions: { connectedStepType: "ITERATOR", settings: { isConnectedToLoop: true } }. Without it the target is placed after the loop instead.
- The last step of the loop body must have an edge back to the ITERATOR, otherwise the loop runs a single iteration.
- An ITERATOR with an empty loop body does not fail: it completes immediately and {{<iterator-id>.currentItem}} resolves to undefined for every step downstream.

Common mistakes to avoid:
- Using "RECORD_CREATED" instead of "DATABASE_EVENT"
- Missing the "name" and "valid" fields in steps
- Missing the "objectRecord" field in CREATE_RECORD actions
- Using "fieldsToUpdate" instead of "objectRecord" in CREATE_RECORD actions
- Including CODE steps in this tool — this tool does NOT create the underlying logic function needed by CODE steps. Instead, create the workflow without CODE steps first, then add CODE steps individually using create_workflow_version_step (which properly creates the logic function), then call update_logic_function_source to define the code.
- Including AI_AGENT steps in this tool — this tool does NOT create the underlying agent needed by AI_AGENT steps. Instead, create the workflow without AI_AGENT steps first, then add AI_AGENT steps individually using create_workflow_version_step (which properly creates the agent), then call update_workflow_agent to configure the agent.

IMPORTANT: The tool schema provides comprehensive field descriptions, examples, and validation rules. Always refer to the schema for:
- Field requirements and data types
- Common object patterns and field structures
- Proper relationship field formats
- Variable reference syntax: {{trigger.properties.after.fieldName}} for a DATABASE_EVENT trigger's record ({{trigger.properties.before.fieldName}} for deleted events), {{trigger.payload.fieldName}} for a MANUAL trigger's selected record, {{trigger.fieldName}} for a WEBHOOK trigger's request body, {{<step-id>.fieldName}} for step outputs (step-id is the step's UUID, not its name). The path mirrors the step's output schema exactly and is addressed directly; Twenty does not add a "result" wrapper. A FIND_RECORDS step exposes {{<find-step-id>.all}} and {{<find-step-id>.first.id}}, not {{<find-step-id>.result.all}}.
- Error handling options

This is the most efficient way for AI to create workflows as it handles all the complexity in one call.

Returns the core workflow ID and core workflow version ID, which every other workflow tool expects.

Call validate_workflow once when the workflow is complete, before activating.`,
  inputSchema: createCompleteWorkflowSchema,
  execute: async (parameters: {
    name: string;
    description?: string;
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
    edges?: Array<{
      source: string;
      target: string;
      sourceConnectionOptions?: z.infer<
        typeof workflowStepConnectionOptionsSchema
      >;
    }>;
    activate?: boolean;
  }) => {
    const creation = await createWorkflowOrBuildFailure({
      deps,
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
      name: parameters.name,
      trigger: parameters.trigger,
      steps: parameters.steps,
      edges: parameters.edges ?? [],
    });

    if ('failure' in creation) {
      return creation.failure;
    }

    const { coreWorkflow, coreWorkflowVersionId } = creation.createdWorkflow;

    const result = {
      coreWorkflowId: coreWorkflow.id,
      coreWorkflowVersionId,
      name: parameters.name,
      stepIds: parameters.steps.map((step) => step.id),
    };

    const recordReferences = isDefined(coreWorkflow.workspaceWorkflowId)
      ? [
          {
            objectNameSingular: 'workflow',
            recordId: coreWorkflow.workspaceWorkflowId,
            displayName: parameters.name,
          },
        ]
      : [];

    if (parameters.activate) {
      try {
        await deps.coreWorkflowLifecycleService.activateCoreWorkflowVersion({
          workspaceId: context.workspaceId,
          userWorkspaceId: context.userWorkspaceId,
          coreWorkflowVersionId,
        });
      } catch (error) {
        return {
          success: false,
          message: `Workflow "${parameters.name}" was created as a draft but could not be activated: ${error.message}. Do not create it again: fix the draft (coreWorkflowVersionId ${coreWorkflowVersionId}), call validate_workflow, then activate_workflow_version.`,
          error: error.message,
          result,
          recordReferences,
        };
      }
    }

    return {
      success: true,
      message: `Workflow "${parameters.name}" created successfully with ${parameters.steps.length} steps`,
      result,
      recordReferences,
    };
  },
});

const createWorkflowOrBuildFailure = async ({
  deps,
  workspaceId,
  userWorkspaceId,
  name,
  trigger,
  steps,
  edges,
}: {
  deps: CreateCompleteWorkflowToolDeps;
  workspaceId: string;
  userWorkspaceId: string | undefined;
  name: string;
  trigger: WorkflowTrigger;
  steps: WorkflowAction[];
  edges: WorkflowVersionEdge[];
}): Promise<
  | { createdWorkflow: CreatedCoreWorkflow }
  | { failure: CreateCompleteWorkflowFailure }
> => {
  try {
    assertStepTypesAreSupported(steps);

    return {
      createdWorkflow:
        await deps.coreWorkflowMutationService.createWorkflowWithContent({
          workspaceId,
          userWorkspaceId,
          name,
          trigger,
          steps,
          edges,
        }),
    };
  } catch (error) {
    return {
      failure: {
        success: false,
        message: `Failed to create workflow "${name}", nothing was created: ${error.message}`,
        error: error.message,
      },
    };
  }
};

const assertStepTypesAreSupported = (steps: WorkflowAction[]): void => {
  if (steps.some((step) => step.type === WorkflowActionType.CODE)) {
    throw new WorkflowVersionStepException(
      'CODE steps cannot be created via create_complete_workflow because it does not create the underlying logic function. Use create_workflow_version_step instead.',
      WorkflowVersionStepExceptionCode.INVALID_REQUEST,
    );
  }

  if (steps.some((step) => step.type === WorkflowActionType.AI_AGENT)) {
    throw new WorkflowVersionStepException(
      'AI_AGENT steps cannot be created via create_complete_workflow because it does not create the underlying agent. Use create_workflow_version_step instead, then call update_workflow_agent to configure the agent.',
      WorkflowVersionStepExceptionCode.INVALID_REQUEST,
    );
  }

  const flagGatedStep = steps.find((step) =>
    isDefined(WORKFLOW_ACTION_FEATURE_FLAGS[step.type]),
  );

  if (isDefined(flagGatedStep)) {
    throw new WorkflowVersionStepException(
      `${flagGatedStep.type} steps cannot be created via create_complete_workflow. Use create_workflow_version_step instead.`,
      WorkflowVersionStepExceptionCode.INVALID_REQUEST,
    );
  }
};
