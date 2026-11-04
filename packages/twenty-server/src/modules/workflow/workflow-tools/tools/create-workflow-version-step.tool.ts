import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID, WorkflowActionType } from 'twenty-shared/workflow';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type CreateCoreWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-core-workflow-version-step.input';
import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';

const baseStepFields = {
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID to add the step to'),
  parentStepId: z
    .string()
    .optional()
    .describe(
      'Optional ID of the parent step this step should come after (UUID, or "trigger" for the trigger step). If not provided, the step will be added at the end of the workflow.',
    ),
  parentStepConnectionOptions: z
    .object({
      type: z.string().optional(),
      conditionGroupIndex: z.number().optional(),
    })
    .optional()
    .describe('Optional parent step connection options'),
  nextStepId: z
    .string()
    .optional()
    .describe('Optional ID of the step this new step should connect to'),
};

const nonLogicFunctionStepTypes = Object.values(WorkflowActionType).filter(
  (type) => type !== WorkflowActionType.LOGIC_FUNCTION,
) as [string, ...string[]];

const createWorkflowVersionStepSchema = z.discriminatedUnion('stepType', [
  z.object({
    ...baseStepFields,
    stepType: z.literal(WorkflowActionType.LOGIC_FUNCTION),
    defaultSettings: z
      .object({
        input: z.object({
          logicFunctionId: z
            .string()
            .describe(
              'The ID of the logic function. Use list_logic_function_tools to discover available IDs.',
            ),
        }),
      })
      .describe(
        'Settings for the LOGIC_FUNCTION step. Must include input.logicFunctionId.',
      ),
  }),
  z.object({
    ...baseStepFields,
    stepType: z.enum(nonLogicFunctionStepTypes),
    defaultSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Optional default settings for the step.'),
  }),
]);

const enrichResultWithNextStep = ({
  result,
  stepType,
}: {
  result: WorkflowVersionStepChangesDTO;
  stepType: WorkflowActionType;
}) => {
  switch (stepType) {
    case WorkflowActionType.CODE:
      return {
        ...result,
        nextStep:
          'This CODE step was created with a default placeholder function. You MUST now call update_logic_function_source with the logicFunctionId from this step to define the actual code. IMPORTANT: Also provide outputSchema (an example return value, e.g. { datePlus7: "2026-06-16" }) so downstream steps can reference this step\'s output variables via {{stepId.fieldName}}.',
      };
    case WorkflowActionType.AI_AGENT:
      return {
        ...result,
        nextStep:
          'If this AI_AGENT step runs no agent (no settings.input.agentId), it was created without instructions: you MUST now call update_workflow_version_step to set settings.input.instructions (its system prompt) and settings.input.prompt (the message sent on each run), and optionally modelId and responseFormat. Use responseFormat { type: "json", schema: { ... } } when downstream steps need to reference structured fields via {{stepId.fieldName}}, otherwise the output is referenced as {{stepId.response}}. The step reads no records until settings.input.scope grants it objects (same shape as a role manifest\'s permissions, with object universal identifiers). If it runs an agent, set settings.input.prompt: the agent supplies the instructions, model and permissions, and its response format unless the step sets settings.input.responseFormat.',
      };
    default:
      return result;
  }
};

@DefineTool({
  name: 'create_workflow_version_step',
  category: ToolCategory.WORKFLOW,
  description:
    'Create a new step in a workflow version. This adds a step to the specified workflow version with the given configuration. If parentStepId is not provided, the step will be appended at the end of the workflow.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  requiredApplicationReach: 'trigger',
  icon: 'IconSettingsAutomation',
})
export class CreateWorkflowVersionStepTool extends BaseTool<
  typeof createWorkflowVersionStepSchema
> {
  readonly inputSchema = createWorkflowVersionStepSchema;

  constructor(
    private readonly coreWorkflowVersionMutationService: CoreWorkflowVersionMutationWorkspaceService,
    private readonly coreWorkflowVersionWriteService: CoreWorkflowVersionWriteService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof createWorkflowVersionStepSchema
  >): Promise<ToolOutput> {
    try {
      const { workspaceId } = context;
      const { coreWorkflowVersionId } = parameters;

      let effectiveParentStepId = parameters.parentStepId;

      if (!isDefined(effectiveParentStepId)) {
        const { steps } =
          await this.coreWorkflowVersionWriteService.getValidatedDraftCoreWorkflowVersion(
            {
              workspaceId,
              userWorkspaceId: context.userWorkspaceId,
              coreWorkflowVersionId,
            },
          );

        const existingSteps = steps ?? [];

        if (existingSteps.length === 0) {
          effectiveParentStepId = TRIGGER_STEP_ID;
        } else {
          const leafSteps = existingSteps.filter(
            (step) =>
              !isDefined(step.nextStepIds) || step.nextStepIds.length === 0,
          );

          effectiveParentStepId =
            leafSteps.length > 1 ? undefined : leafSteps[0]?.id;
        }
      }

      const result = await this.coreWorkflowVersionMutationService.createStep({
        workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        input: {
          ...parameters,
          parentStepId: effectiveParentStepId,
        } as CreateCoreWorkflowVersionStepInput,
      });

      await this.coreWorkflowVersionMutationService.autoLayoutCoreWorkflowVersion(
        {
          workspaceId,
          userWorkspaceId: context.userWorkspaceId,
          coreWorkflowVersionId,
        },
      );

      return {
        success: true,
        message: 'Workflow version step created',
        result: enrichResultWithNextStep({
          result,
          stepType: parameters.stepType as WorkflowActionType,
        }),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to create workflow version step: ${error.message}`,
      };
    }
  }
}
