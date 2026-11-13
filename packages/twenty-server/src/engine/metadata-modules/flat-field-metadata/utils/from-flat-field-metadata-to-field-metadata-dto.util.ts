import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import {
  type FlatFieldMetadataOptionMapsForOptions,
  resolveFlatFieldMetadataOptions,
} from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

type FromFlatFieldMetadataToFieldMetadataDtoArgs =
  | {
      flatFieldMetadata: FlatFieldMetadata;
      flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
    }
  | { flatFieldMetadataWithResolvedOptions: FlatFieldMetadata };

export const fromFlatFieldMetadataToFieldMetadataDto = (
  args: FromFlatFieldMetadataToFieldMetadataDtoArgs,
): FieldMetadataDTO => {
  const flatFieldMetadata =
    'flatFieldMetadataWithResolvedOptions' in args
      ? args.flatFieldMetadataWithResolvedOptions
      : args.flatFieldMetadata;

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
    options:
      'flatFieldMetadataWithResolvedOptions' in args
        ? flatFieldMetadata.options
        : resolveFlatFieldMetadataOptions({
            flatFieldMetadata,
            flatFieldMetadataOptionMaps: args.flatFieldMetadataOptionMaps,
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
