import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import {
  workflowActionSchema,
  workflowTriggerSchema,
} from 'twenty-shared/workflow';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { canCallerReachEveryApplication } from 'src/modules/workflow/workflow-tools/utils/can-caller-reach-every-application.util';

const computeStepOutputSchemaSchema = z.object({
  step: z
    .union([workflowTriggerSchema, workflowActionSchema])
    .describe('The workflow step configuration'),
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID'),
});

@DefineTool({
  name: 'compute_step_output_schema',
  category: ToolCategory.WORKFLOW,
  description:
    'Compute the output schema for a workflow step. This determines what data the step produces. The step parameter must be a valid WorkflowTrigger or WorkflowAction with the correct settings structure for its type.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  icon: 'IconSettingsAutomation',
})
export class ComputeStepOutputSchemaTool extends BaseTool<
  typeof computeStepOutputSchemaSchema
> {
  readonly inputSchema = computeStepOutputSchemaSchema;

  constructor(
    private readonly coreWorkflowVersionListService: CoreWorkflowVersionListService,
    private readonly workflowSchemaService: WorkflowSchemaWorkspaceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof computeStepOutputSchemaSchema
  >): Promise<ToolOutput> {
    if (!canCallerReachEveryApplication(context)) {
      return buildToolNotAvailableOutput('compute_step_output_schema');
    }

    try {
      const coreWorkflowVersion =
        await this.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId(
          {
            workspaceId: context.workspaceId,
            userWorkspaceId: context.userWorkspaceId,
            callerApplication: undefined,
            coreWorkflowVersionId: parameters.coreWorkflowVersionId,
          },
        );

      if (!isDefined(coreWorkflowVersion)) {
        return {
          success: false,
          error: `Workflow version ${parameters.coreWorkflowVersionId} not found`,
          message: `Workflow version ${parameters.coreWorkflowVersionId} not found`,
        };
      }

      return {
        success: true,
        message: 'Step output schema computed',
        result: await this.workflowSchemaService.computeStepOutputSchema({
          step: parameters.step as WorkflowTrigger | WorkflowAction,
          workspaceId: context.workspaceId,
          workflowVersionContent: {
            trigger: coreWorkflowVersion.trigger,
            steps: coreWorkflowVersion.steps,
          },
        }),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to compute step output schema: ${error.message}`,
      };
    }
  }
}
