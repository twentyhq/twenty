import {
  capitalize,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { buildDefaultFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { buildDefaultIndexesForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-index-for-custom-object.util';
import { buildDefaultRelationFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-relation-flat-field-metadatas-for-custom-object.util';

type FromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreateArgs =
  {
    createObjectInput: Omit<CreateObjectInput, 'workspaceId'>;
    workspaceId: string;
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  };
export const fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate =
  ({
    createObjectInput: rawCreateObjectInput,
    workspaceId,
    existingFlatObjectMetadataMaps,
  }: FromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreateArgs): {
    flatObjectMetadataToCreate: FlatObjectMetadata;
    relationTargetFlatFieldMetadataToCreate: FlatFieldMetadata[];
    flatIndexMetadataToCreate: FlatIndexMetadata[];
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
    const defaultFlatFieldForCustomObjectMaps =
      buildDefaultFlatFieldMetadatasForCustomObject({
        flatObjectMetadata: {
          id: objectMetadataId,
        },
        workspaceId,
      });
    const createdAt = new Date();
    const flatObjectMetadataToCreate: FlatObjectMetadata = {
      createdAt,
      flatFieldMetadatas: [],
      updatedAt: createdAt,
      duplicateCriteria: null,
      description: createObjectInput.description ?? null,
      icon: createObjectInput.icon ?? null,
      id: objectMetadataId,
      imageIdentifierFieldMetadataId: null,
      isActive: true,
      isAuditLogged: true,
      isCustom: true,
      isLabelSyncedWithName: createObjectInput.isLabelSyncedWithName ?? false,
      isRemote: createObjectInput.isRemote ?? false,
      isSearchable: true,
      isUIReadOnly: false,
      isSystem: false,
      labelIdentifierFieldMetadataId:
        defaultFlatFieldForCustomObjectMaps.fields.nameField.id,
      labelPlural: capitalize(createObjectInput.labelPlural),
      labelSingular: capitalize(createObjectInput.labelSingular),
      namePlural: createObjectInput.namePlural,
      nameSingular: createObjectInput.nameSingular,
      shortcut: createObjectInput.shortcut ?? null,
      standardId: createObjectInput.standardId ?? null,
      standardOverrides: null,
      applicationId: createObjectInput.applicationId ?? null,
      universalIdentifier: objectMetadataId,
      targetTableName: 'DEPRECATED',
      workspaceId,
    };

    const {
      standardSourceFlatFieldMetadatas,
      standardTargetFlatFieldMetadatas,
    } = buildDefaultRelationFlatFieldMetadatasForCustomObject({
      existingFlatObjectMetadataMaps,
      sourceFlatObjectMetadata: flatObjectMetadataToCreate,
      workspaceId,
    });

    flatObjectMetadataToCreate.flatFieldMetadatas = [
      ...Object.values(defaultFlatFieldForCustomObjectMaps.fields),
      ...standardSourceFlatFieldMetadatas,
    ];

    const defaultIndexesForCustomObject = buildDefaultIndexesForCustomObject({
      defaultFlatFieldForCustomObjectMaps,
      flatObjectMetadata: flatObjectMetadataToCreate,
      workspaceId,
    });

    return {
      flatObjectMetadataToCreate,
      relationTargetFlatFieldMetadataToCreate: standardTargetFlatFieldMetadatas,
      flatIndexMetadataToCreate: Object.values(
        defaultIndexesForCustomObject.indexes,
      ),
    };
  };
