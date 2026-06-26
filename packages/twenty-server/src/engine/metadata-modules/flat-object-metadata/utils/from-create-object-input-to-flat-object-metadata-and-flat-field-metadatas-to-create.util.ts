import {
  capitalize,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { buildDefaultFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type FromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreateArgs =
  {
    createObjectInput: CreateObjectInput;
    flatApplication: FlatApplication;
  };
export const fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate =
  ({
    createObjectInput: rawCreateObjectInput,
    flatApplication,
  }: FromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreateArgs): {
    flatObjectMetadataToCreate: UniversalFlatObjectMetadata & { id: string };
    flatFieldMetadataToCreateOnObject: UniversalFlatFieldMetadata[];
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
      color: createObjectInput.color ?? null,
      description: createObjectInput.description ?? null,
      icon: createObjectInput.icon ?? null,
      isActive: true,
      isAuditLogged: true,
      isLabelSyncedWithName: createObjectInput.isLabelSyncedWithName ?? false,
      isRemote: createObjectInput.isRemote ?? false,
      isSearchable: true,
      isUIEditable: true,
      isUICreatable: true,
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
      objectPermissionUniversalIdentifiers: [],
      fieldPermissionUniversalIdentifiers: [],
      viewUniversalIdentifiers: [],
      indexMetadataUniversalIdentifiers: [],
      searchFieldMetadataUniversalIdentifiers: [],
      labelIdentifierFieldMetadataUniversalIdentifier,
      imageIdentifierFieldMetadataUniversalIdentifier: null,
    };

    return {
      flatObjectMetadataToCreate: universalFlatObjectMetadataToCreate,
      flatFieldMetadataToCreateOnObject: Object.values(
        defaultFlatFieldForCustomObjectMaps.fields,
      ),
    };
  };
