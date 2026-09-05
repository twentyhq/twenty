import {
  isDefined,
  isFieldMetadataEligibleForRecordForm,
} from 'twenty-shared/utils';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export type RecordFormCandidateFlatFieldMetadata = Pick<
  UniversalFlatFieldMetadata,
  | 'universalIdentifier'
  | 'name'
  | 'type'
  | 'isActive'
  | 'isSystem'
  | 'isUIEditable'
  | 'isSystemSideEffect'
  | 'universalSettings'
>;

export const isFlatFieldMetadataEligibleForRecordForm = (
  flatFieldMetadata: RecordFormCandidateFlatFieldMetadata,
): boolean => {
  if (flatFieldMetadata.isSystemSideEffect) {
    return false;
  }

  const { universalSettings } = flatFieldMetadata;

  return isFieldMetadataEligibleForRecordForm({
    fieldName: flatFieldMetadata.name,
    fieldType: flatFieldMetadata.type,
    isActive: flatFieldMetadata.isActive,
    isSystem: flatFieldMetadata.isSystem,
    isUIEditable: flatFieldMetadata.isUIEditable,
    relationType:
      isDefined(universalSettings) && 'relationType' in universalSettings
        ? universalSettings.relationType
        : undefined,
  });
};
