import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import {
  type FlatFieldMetadataOptionMapsForOptions,
  resolveFlatFieldMetadataOptions,
} from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

export const fromFlatFieldMetadataToFieldMetadataDto = ({
  flatFieldMetadata,
  flatFieldMetadataOptionMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatFieldMetadataOptionMaps?: FlatFieldMetadataOptionMapsForOptions;
}): FieldMetadataDTO => {
  const {
    createdAt,
    updatedAt,
    description,
    icon,
    overrides,
    isNullable,
    isUnique,
    isSearchable,
    isAuditLogged,
    settings,
    id,
    universalIdentifier,
    label,
    name,
    objectMetadataId,
    type,
    workspaceId,
    defaultValue,
    isLabelSyncedWithName,
    isSystem,
    isUIEditable,
    isSystemSideEffect,
    disabledFieldPermissionActions,
    morphId,
    applicationId,
  } = flatFieldMetadata;

  return {
    id,
    universalIdentifier,
    label,
    name,
    objectMetadataId,
    type,
    workspaceId,
    defaultValue,
    isActive: resolveEffectiveFlatEntityProperty({
      metadataName: 'fieldMetadata',
      flatEntity: flatFieldMetadata,
      property: 'isActive',
    }),
    isLabelSyncedWithName,
    isSystem,
    isUIEditable,
    isUIReadOnly: !isUIEditable,
    isSystemSideEffect,
    disabledFieldPermissionActions,
    options: resolveFlatFieldMetadataOptions({
      flatFieldMetadata,
      flatFieldMetadataOptionMaps,
    }),
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    description: description ?? undefined,
    icon: icon ?? undefined,
    overrides: overrides ?? undefined,
    isNullable: isNullable ?? false,
    isUnique: isUnique ?? false,
    isSearchable: isSearchable ?? false,
    isAuditLogged,
    settings: settings ?? undefined,
    morphId: morphId ?? undefined,
    applicationId: applicationId ?? undefined,
  };
};
