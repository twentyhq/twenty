import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import {
  capitalize,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { buildNameFlatFieldMetadataForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-name-flat-field-metadata-for-custom-object.util';
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
    const createdAt = new Date().toISOString();

    const labelIdentifierFieldMetadataUniversalIdentifier =
      getFieldUniversalIdentifier({
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
        objectUniversalIdentifier: universalIdentifier,
        name: createObjectInput.skipNameField ? 'id' : 'name',
      });

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
      overrides: null,
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

    const nameFlatFieldMetadata =
      createObjectInput.skipNameField === true
        ? null
        : buildNameFlatFieldMetadataForCustomObject({
            flatObjectMetadata: {
              applicationUniversalIdentifier:
                flatApplication.universalIdentifier,
              universalIdentifier,
            },
          });

    const flatFieldMetadataToCreateOnObject: UniversalFlatFieldMetadata[] =
      isDefined(nameFlatFieldMetadata) ? [nameFlatFieldMetadata] : [];

    return {
      flatObjectMetadataToCreate: universalFlatObjectMetadataToCreate,
      flatFieldMetadataToCreateOnObject,
    };
  };
