import {
  isDefined,
  isFieldMetadataEligibleForRecordForm,
} from 'twenty-shared/utils';

import { isFieldMetadataUIEditable } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-field-metadata-ui-editable.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

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
  | 'formula'
  | 'applicationUniversalIdentifier'
  | 'overrides'
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
    isActive: resolveEffectiveFlatEntityProperty({
      metadataName: 'fieldMetadata',
      flatEntity: flatFieldMetadata,
      property: 'isActive',
    }),
    isSystem: flatFieldMetadata.isSystem,
    isUIEditable: isFieldMetadataUIEditable({
      isUIEditable: flatFieldMetadata.isUIEditable,
      formula: flatFieldMetadata.formula,
    }),
    relationType:
      isDefined(universalSettings) && 'relationType' in universalSettings
        ? universalSettings.relationType
        : undefined,
  });
};
