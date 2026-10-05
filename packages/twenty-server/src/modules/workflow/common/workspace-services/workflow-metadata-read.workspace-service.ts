import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import {
  WorkflowCommonException,
  WorkflowCommonExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-common.exception';

export type ObjectMetadataInfo = {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

@Injectable()
export class WorkflowMetadataReadService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getFlatEntityMaps(workspaceId: string): Promise<{
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    objectIdByNameSingular: Record<string, string>;
  }> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    return {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular: idByNameSingular,
    };
  }

  async getLogicFunctionById({
    logicFunctionId,
    workspaceId,
  }: {
    logicFunctionId: string;
    workspaceId: string;
  }): Promise<FlatLogicFunction | undefined> {
    const { flatLogicFunctionMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: logicFunctionId,
      flatEntityMaps: flatLogicFunctionMaps,
    });
  }

  async getObjectMetadataInfo(
    objectNameSingular: string,
    workspaceId: string,
  ): Promise<ObjectMetadataInfo> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } = await this.getFlatEntityMaps(workspaceId);

    const objectId = objectIdByNameSingular[objectNameSingular];

    if (!isDefined(objectId)) {
      throw new WorkflowCommonException(
        `Failed to read: Object ${objectNameSingular} not found`,
        WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new WorkflowCommonException(
        `Failed to read: Object ${objectNameSingular} not found`,
        WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    return {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    };
  }
}
