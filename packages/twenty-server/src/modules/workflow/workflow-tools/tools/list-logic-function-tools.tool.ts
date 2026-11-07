import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';
import { canCallerReachEveryApplication } from 'src/modules/workflow/workflow-tools/utils/can-caller-reach-every-application.util';

const listLogicFunctionToolsSchema = z.object({});

@DefineTool({
  name: 'list_logic_function_tools',
  category: ToolCategory.WORKFLOW,
  description:
    'List all logic functions exposed as workflow actions, which can be added as LOGIC_FUNCTION steps in workflows. Returns their IDs, names, and descriptions.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  icon: 'IconSettingsAutomation',
})
export class ListLogicFunctionToolsTool extends BaseTool<
  typeof listLogicFunctionToolsSchema
> {
  readonly inputSchema = listLogicFunctionToolsSchema;

  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super();
  }

  async execute({
    context,
  }: ToolExecuteArgs<
    typeof listLogicFunctionToolsSchema
  >): Promise<ToolOutput> {
    if (!canCallerReachEveryApplication(context)) {
      return buildToolNotAvailableOutput('list_logic_function_tools');
    }

    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: context.workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const workflowActionFunctions = Object.values(
      flatLogicFunctionMaps.byUniversalIdentifier,
    ).filter(
      (fn): fn is FlatLogicFunction =>
        isDefined(fn) &&
        isDefined(fn.workflowActionTriggerSettings) &&
        fn.deletedAt === null,
    );

    return {
      success: true,
      message: `Found ${workflowActionFunctions.length} logic function(s) usable as workflow steps`,
      result: {
        logicFunctions: workflowActionFunctions.map((fn) => ({
          id: fn.id,
          name: fn.name,
          displayName: fn.workflowActionTriggerSettings?.label ?? fn.name,
          description: fn.description,
        })),
      },
    };
  }
}
