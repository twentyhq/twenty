import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const listLogicFunctionToolsSchema = z.object({});

export const createListLogicFunctionToolsTool = (
  deps: Pick<WorkflowToolDependencies, 'logicFunctionFromSourceHelperService'>,
  context: WorkflowToolContext,
) => ({
  name: 'list_logic_function_tools' as const,
  description:
    'List all logic functions exposed as workflow actions, which can be added as LOGIC_FUNCTION steps in workflows. Returns their IDs, names, and descriptions.',
  inputSchema: listLogicFunctionToolsSchema,
  execute: async () => {
    const logicFunctions =
      await deps.logicFunctionFromSourceHelperService.findManyLogicFunctions({
        workspaceId: context.workspaceId,
      });

    const workflowActionFunctions = logicFunctions.filter((fn) =>
      isDefined(fn.workflowActionTriggerSettings),
    );

    return {
      success: true,
      logicFunctions: workflowActionFunctions.map((fn) => ({
        id: fn.id,
        name: fn.name,
        displayName: fn.workflowActionTriggerSettings?.label ?? fn.name,
        description: fn.description,
      })),
    };
  },
});
