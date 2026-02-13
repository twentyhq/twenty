import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type WorkflowToolContext } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const listLogicFunctionToolsSchema = z.object({});

export const createListLogicFunctionToolsTool = (
  deps: {
    flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;
  },
  context: WorkflowToolContext,
) => ({
  name: 'list_logic_function_tools' as const,
  description:
    'List all logic functions marked as tools that can be added as LOGIC_FUNCTION steps in workflows. Returns their IDs, names, and descriptions.',
  inputSchema: listLogicFunctionToolsSchema,
  execute: async () => {
    const { flatLogicFunctionMaps } =
      await deps.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: context.workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const toolFunctions = Object.values(
      flatLogicFunctionMaps.byUniversalIdentifier,
    ).filter(
      (fn): fn is FlatLogicFunction =>
        isDefined(fn) && fn.isTool === true && fn.deletedAt === null,
    );

    return {
      success: true,
      logicFunctions: toolFunctions.map((fn) => ({
        id: fn.id,
        name: fn.name,
        description: fn.description,
      })),
    };
  },
});
