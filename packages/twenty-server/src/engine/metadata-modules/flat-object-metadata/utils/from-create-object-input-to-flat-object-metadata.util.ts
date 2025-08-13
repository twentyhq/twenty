import {
  capitalize,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { buildDefaultFlatFieldMetadataForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-fields-for-custom-object.util';

export const fromCreateObjectInputToFlatObjectMetadata = ({
  createObjectInput: rawCreateObjectInput,
  workspaceId,
}: {
  createObjectInput: Omit<CreateObjectInput, 'workspaceId'>;
  workspaceId: string;
}): FlatObjectMetadata => {
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
  const baseCustomFlatFieldMetadatas =
    buildDefaultFlatFieldMetadataForCustomObject({
      objectMetadataId,
      workspaceId,
    });

  const createdAt = new Date();

  return {
    createdAt,
    updatedAt: createdAt,
    duplicateCriteria: null,
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
    isRemote: createObjectInput.isRemote ?? false,
    isSearchable: true,
    isSystem: false,
    labelIdentifierFieldMetadataId: baseCustomFlatFieldMetadatas.nameField.id,
    labelPlural: capitalize(createObjectInput.labelPlural),
    labelSingular: capitalize(createObjectInput.labelSingular),
    namePlural: createObjectInput.namePlural,
    nameSingular: createObjectInput.nameSingular,
    shortcut: createObjectInput.shortcut ?? null,
    standardId: null,
    standardOverrides: null,
    uniqueIdentifier: objectMetadataId,
    targetTableName: 'DEPRECATED',
    workspaceId,
  };
};
