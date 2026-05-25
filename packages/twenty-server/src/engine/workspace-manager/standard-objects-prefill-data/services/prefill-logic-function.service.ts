import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { type PrefilledWorkflowCodeStepLogicFunctionDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflow-code-step-logic-functions.util';

@Injectable()
export class PrefillLogicFunctionService {
  constructor(
    private readonly logicFunctionFromSourceService: LogicFunctionFromSourceService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async ensureSeeded({
    workspaceId,
    definitions,
  }: {
    workspaceId: string;
    definitions: PrefilledWorkflowCodeStepLogicFunctionDefinition[];
  }) {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    for (const definition of definitions) {
      const existingLogicFunction = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: definition.id,
        flatEntityMaps: flatLogicFunctionMaps,
      });

      if (isDefined(existingLogicFunction)) {
        continue;
      }

      await this.logicFunctionFromSourceService.createOneFromSource({
        workspaceId,
        input: {
          id: definition.id,
          name: definition.name,
          description: definition.description,
          source: {
            sourceHandlerCode: definition.sourceHandlerCode,
            handlerName: 'main',
          },
        },
      });
    }
  }
}
