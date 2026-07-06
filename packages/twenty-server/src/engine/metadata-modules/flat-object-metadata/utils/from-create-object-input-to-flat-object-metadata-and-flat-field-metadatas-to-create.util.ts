import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import {
  capitalize,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type FromCreateObjectInputToFlatObjectMetadataToCreateArgs = {
  createObjectInput: CreateObjectInput;
  flatApplication: FlatApplication;
};

// The default fields, relations, indexes and searchFieldMetadata are no longer
// materialized here: they are synthesized by the objectMetadata side-effect
// handlers in the metadata side-effect engine. This transpiler only produces the
// object metadata itself, with a deterministic label identifier so the view /
// viewField / pageLayout side effects can reference it.
export const fromCreateObjectInputToFlatObjectMetadataToCreate = ({
  createObjectInput: rawCreateObjectInput,
  flatApplication,
}: FromCreateObjectInputToFlatObjectMetadataToCreateArgs): {
  flatObjectMetadataToCreate: UniversalFlatObjectMetadata & { id: string };
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

  return {
    flatObjectMetadataToCreate: universalFlatObjectMetadataToCreate,
  };
};
