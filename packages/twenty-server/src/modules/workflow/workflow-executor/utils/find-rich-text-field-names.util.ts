import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

export const findRichTextFieldNames = (
  objectMetadataInfo: ObjectMetadataInfo,
): string[] => {
  const { flatObjectMetadata, flatFieldMetadataMaps } = objectMetadataInfo;

  return findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: flatObjectMetadata.fieldIds,
    flatEntityMaps: flatFieldMetadataMaps,
  })
    .filter((field) => field?.type === FieldMetadataType.RICH_TEXT)
    .map((field) => field?.name)
    .filter(isDefined);
};
