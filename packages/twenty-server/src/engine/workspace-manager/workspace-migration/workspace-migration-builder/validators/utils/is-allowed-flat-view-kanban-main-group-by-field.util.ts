import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const isAllowedFlatViewKanbanMainGroupByField = ({
  mainGroupByFieldMetadata,
}: {
  mainGroupByFieldMetadata: UniversalFlatFieldMetadata;
}): boolean => {
  if (mainGroupByFieldMetadata.type === FieldMetadataType.SELECT) {
    return true;
  }

  if (!isMorphOrRelationUniversalFlatFieldMetadata(mainGroupByFieldMetadata)) {
    return false;
  }

  return (
    mainGroupByFieldMetadata.type === FieldMetadataType.RELATION &&
    mainGroupByFieldMetadata.universalSettings?.relationType ===
      RelationType.MANY_TO_ONE
  );
};
