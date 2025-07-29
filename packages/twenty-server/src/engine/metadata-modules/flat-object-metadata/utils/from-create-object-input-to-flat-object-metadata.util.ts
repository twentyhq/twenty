import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { buildDefaultFlatFieldMetadataForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-fields-for-custom-object.util';

export const fromCreateObjectInputToFlatObjectMetadata = (
  rawCreateObjectInput: CreateObjectInput,
): FlatObjectMetadata => {
  // Handled in FlatObjectMetadata validation
  // if (rawCreateObjectInput.isRemote) {
  //   throw new Error('Remote objects are not supported yet');
  // }

  const createObjectInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateObjectInput,
      [
        'description',
        'icon',
        'labelPlural',
        'labelSingular',
        'namePlural',
        'nameSingular',
        'shortcut',
      ],
    );

  const objectMetadataId = v4();
  const createdAt = new Date();
  const baseCustomFlatFieldMetadatas =
    buildDefaultFlatFieldMetadataForCustomObject({
      createdAt,
      objectMetadataId,
      workspaceId: createObjectInput.workspaceId,
    });

  return {
    description: createObjectInput.description ?? null,
    flatFieldMetadatas: Object.values(baseCustomFlatFieldMetadatas),
    flatIndexMetadatas: [],
    icon: createObjectInput.icon ?? null,
    id: objectMetadataId,
    imageIdentifierFieldMetadataId: null,
    isActive: true,
    isAuditLogged: true,
    isCustom: true,
    isLabelSyncedWithName: createObjectInput.isLabelSyncedWithName ?? false,
    isRemote: false,
    isSearchable: true,
    isSystem: false,
    labelIdentifierFieldMetadataId: baseCustomFlatFieldMetadatas.nameField.id,
    labelPlural: createObjectInput.labelPlural ?? null,
    labelSingular: createObjectInput.labelSingular ?? null,
    namePlural: createObjectInput.namePlural ?? null,
    nameSingular: createObjectInput.nameSingular ?? null,
    shortcut: createObjectInput.shortcut ?? null,
    standardId: null,
    standardOverrides: null,
    uniqueIdentifier: objectMetadataId,
    targetTableName: 'DEPRECATED',
    workspaceId: createObjectInput.workspaceId,
  };
};
