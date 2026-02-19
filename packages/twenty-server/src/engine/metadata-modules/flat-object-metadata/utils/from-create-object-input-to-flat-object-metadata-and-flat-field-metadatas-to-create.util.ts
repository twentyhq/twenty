import {
  capitalize,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { buildDefaultFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { buildDefaultIndexesForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-index-for-custom-object.util';
import { buildDefaultRelationFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-relation-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type FromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreateArgs =
  {
    createObjectInput: CreateObjectInput;
    flatApplication: FlatApplication;
    existingFeatureFlagsMap: FeatureFlagMap;
  } & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'>;
export const fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate =
  ({
    createObjectInput: rawCreateObjectInput,
    flatApplication,
    flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    existingFeatureFlagsMap,
  }: FromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreateArgs): {
    flatObjectMetadataToCreate: UniversalFlatObjectMetadata & { id: string };
    relationTargetFlatFieldMetadataToCreate: UniversalFlatFieldMetadata[];
    flatFieldMetadataToCreateOnObject: UniversalFlatFieldMetadata[];
    flatIndexMetadataToCreate: UniversalFlatIndexMetadata[];
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
    const universalIdentifier = createObjectInput.universalIdentifier ?? v4();
    const defaultFlatFieldForCustomObjectMaps =
      buildDefaultFlatFieldMetadatasForCustomObject({
        flatObjectMetadata: {
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
          universalIdentifier,
        },
        skipNameField: createObjectInput.skipNameField,
      });
    const createdAt = new Date().toISOString();

    // Use nameField.id if it exists, otherwise use idField.id (for junction tables without name)
    const nameField = defaultFlatFieldForCustomObjectMaps.fields.nameField;
    const labelIdentifierFieldMetadataUniversalIdentifier =
      nameField?.universalIdentifier ??
      defaultFlatFieldForCustomObjectMaps.fields.id.universalIdentifier;

    const universalFlatObjectMetadataToCreate: UniversalFlatObjectMetadata & {
      id: string;
    } = {
      id: objectMetadataId,
      universalIdentifier,
      createdAt,
      updatedAt: createdAt,
      duplicateCriteria: null,
      description: createObjectInput.description ?? null,
      icon: createObjectInput.icon ?? null,
      isActive: true,
      isAuditLogged: true,
      isCustom: true,
      isLabelSyncedWithName: createObjectInput.isLabelSyncedWithName ?? false,
      isRemote: createObjectInput.isRemote ?? false,
      isSearchable: true,
      isUIReadOnly: false,
      isSystem: false,
      labelPlural: capitalize(createObjectInput.labelPlural),
      labelSingular: capitalize(createObjectInput.labelSingular),
      namePlural: createObjectInput.namePlural,
      nameSingular: createObjectInput.nameSingular,
      shortcut: createObjectInput.shortcut ?? null,
      standardOverrides: null,
      targetTableName: 'DEPRECATED',
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      fieldUniversalIdentifiers: [],
      viewUniversalIdentifiers: [],
      indexMetadataUniversalIdentifiers: [],
      labelIdentifierFieldMetadataUniversalIdentifier,
      imageIdentifierFieldMetadataUniversalIdentifier: null,
    };

    const {
      standardSourceFlatFieldMetadatas,
      standardTargetFlatFieldMetadatas,
    } = buildDefaultRelationFlatFieldMetadatasForCustomObject({
      existingFlatObjectMetadataMaps,
      sourceFlatObjectMetadata: universalFlatObjectMetadataToCreate,
      flatApplication,
      existingFeatureFlagsMap,
    });

    const objectFlatFieldMetadatas: UniversalFlatFieldMetadata[] = [
      ...Object.values(defaultFlatFieldForCustomObjectMaps.fields),
      ...standardSourceFlatFieldMetadatas,
    ];

    const defaultIndexesForCustomObject = buildDefaultIndexesForCustomObject({
      objectFlatFieldMetadatas,
      defaultFlatFieldForCustomObjectMaps,
      flatObjectMetadata: universalFlatObjectMetadataToCreate,
    });

    return {
      flatObjectMetadataToCreate: universalFlatObjectMetadataToCreate,
      flatIndexMetadataToCreate: Object.values(
        defaultIndexesForCustomObject.indexes,
      ),
      relationTargetFlatFieldMetadataToCreate: standardTargetFlatFieldMetadatas,
      flatFieldMetadataToCreateOnObject: objectFlatFieldMetadatas,
    };
  };
