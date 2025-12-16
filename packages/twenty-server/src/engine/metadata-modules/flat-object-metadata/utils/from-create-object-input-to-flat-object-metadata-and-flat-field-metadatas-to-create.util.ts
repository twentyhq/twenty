import {
  capitalize,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { buildDefaultFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { buildDefaultIndexesForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-index-for-custom-object.util';
import { buildDefaultRelationFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-relation-flat-field-metadatas-for-custom-object.util';

type FromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreateArgs =
  {
    createObjectInput: CreateObjectInput;
    workspaceId: string;
    workspaceCustomApplicationId: string;
    existingFeatureFlagsMap: FeatureFlagMap;
  } & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'>;
export const fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate =
  ({
    createObjectInput: rawCreateObjectInput,
    workspaceId,
    workspaceCustomApplicationId,
    flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    existingFeatureFlagsMap,
  }: FromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreateArgs): {
    flatObjectMetadataToCreate: FlatObjectMetadata;
    relationTargetFlatFieldMetadataToCreate: FlatFieldMetadata[];
    flatFieldMetadataToCreateOnObject: FlatFieldMetadata[];
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
          applicationId: workspaceCustomApplicationId,
        },
        workspaceId,
      });
    const createdAt = new Date().toISOString();
    const flatObjectMetadataToCreate: FlatObjectMetadata = {
      fieldMetadataIds: [],
      viewIds: [],
      indexMetadataIds: [],
      createdAt,
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
      applicationId: workspaceCustomApplicationId,
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
      workspaceCustomApplicationId,
      existingFeatureFlagsMap,
    });

    const objectFlatFieldMetadatas: FlatFieldMetadata[] = [
      ...Object.values(defaultFlatFieldForCustomObjectMaps.fields),
      ...standardSourceFlatFieldMetadatas,
    ];

    const defaultIndexesForCustomObject = buildDefaultIndexesForCustomObject({
      objectFlatFieldMetadatas,
      defaultFlatFieldForCustomObjectMaps,
      flatObjectMetadata: flatObjectMetadataToCreate,
      workspaceId,
    });

    return {
      flatObjectMetadataToCreate,
      flatIndexMetadataToCreate: Object.values(
        defaultIndexesForCustomObject.indexes,
      ),
      relationTargetFlatFieldMetadataToCreate: standardTargetFlatFieldMetadatas,
      flatFieldMetadataToCreateOnObject: objectFlatFieldMetadatas,
    };
  };
