import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  WorkflowCommonException,
  WorkflowCommonExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-common.exception';
import {
  type ObjectMetadataInfo,
  type WorkflowObjectMetadataMaps,
} from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';

export const getObjectMetadataInfoOrThrow = ({
  objectNameSingular,
  objectMetadataMaps: {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectIdByNameSingular,
  },
}: {
  objectNameSingular: string;
  objectMetadataMaps: WorkflowObjectMetadataMaps;
}): ObjectMetadataInfo => {
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
};
