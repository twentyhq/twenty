import {
  capitalize,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-out-of-flat-field-metadatas-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { buildDefaultFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { buildDefaultRelationFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-relation-flat-field-metadatas-for-custom-object.util';

type FromCreateObjectInputToFlatObjectMetadataMapsArgs = {
  createObjectInput: Omit<CreateObjectInput, 'workspaceId'>;
  workspaceId: string;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const fromCreateObjectInputToFlatObjectMetadataMetadataMaps = ({
  createObjectInput: rawCreateObjectInput,
  workspaceId,
  existingFlatObjectMetadataMaps,
}: FromCreateObjectInputToFlatObjectMetadataMapsArgs): {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  objectMetadataToCreateId: string;
} => {
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
    buildDefaultFlatFieldMetadatasForCustomObject({
      objectMetadataId,
      workspaceId,
    });
  const createdAt = new Date();
  const flatObjectMetadata: FlatObjectMetadata = {
    createdAt,
    flatFieldMetadatas: [],
    updatedAt: createdAt,
    duplicateCriteria: null,
    description: createObjectInput.description ?? null,
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
  const { standardSourceFlatFieldMetadatas, standardTargetFlatFieldMetadatas } =
    buildDefaultRelationFlatFieldMetadatasForCustomObject({
      existingFlatObjectMetadataMaps,
      sourceFlatObjectMetadata: flatObjectMetadata,
      workspaceId,
    });

  flatObjectMetadata.flatFieldMetadatas = [
    ...Object.values(baseCustomFlatFieldMetadatas),
    ...standardSourceFlatFieldMetadatas,
  ];

  try {
    const existingFlatObjectMetadataMapsWithTargetRelationFlatFieldMetadatas =
      standardTargetFlatFieldMetadatas.reduce(
        (flatObjectMetadataMaps, flatFieldMetadata) =>
          addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatFieldMetadata,
            flatObjectMetadataMaps,
          }),
        existingFlatObjectMetadataMaps,
      );

    const flatObjectMetadataMapsWithStandardTargetRelationFlatFieldMetadatas =
      getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow({
        flatFieldMetadatas: standardTargetFlatFieldMetadatas,
        flatObjectMetadataMaps:
          existingFlatObjectMetadataMapsWithTargetRelationFlatFieldMetadatas,
      });

    return {
      flatObjectMetadataMaps:
        addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
          flatObjectMetadata,
          flatObjectMetadataMaps:
            flatObjectMetadataMapsWithStandardTargetRelationFlatFieldMetadatas,
        }),
      objectMetadataToCreateId: objectMetadataId,
    };
  } catch {
    throw new ObjectMetadataException(
      'Existing flat object metadata maps does not contains standard objects, should never occur',
      ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
    );
  }
};
