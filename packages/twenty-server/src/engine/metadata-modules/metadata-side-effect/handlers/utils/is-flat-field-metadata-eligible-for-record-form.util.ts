import { isFieldMetadataEligibleForRecordForm } from 'twenty-shared/utils';

import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const isFlatFieldMetadataEligibleForRecordForm = (
  flatFieldMetadata: UniversalFlatFieldMetadata,
): boolean =>
  isFieldMetadataEligibleForRecordForm({
    fieldName: flatFieldMetadata.name,
    fieldType: flatFieldMetadata.type,
    isActive: flatFieldMetadata.isActive,
    isSystem: flatFieldMetadata.isSystem,
    isUIEditable: flatFieldMetadata.isUIEditable,
    relationType: isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadata)
      ? flatFieldMetadata.universalSettings?.relationType
      : undefined,
  });
