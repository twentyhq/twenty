import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import {
  capitalize,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { buildDefaultFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { buildDefaultRelationFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-relation-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type FromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreateArgs =
  {
    createObjectInput: CreateObjectInput;
    flatApplication: FlatApplication;
  } & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'>;

// The reserved system fields, their system indexes, the GIN searchVector index
// and the searchFieldMetadata are synthesized by the objectMetadata side-effect
// engine handlers. This transpiler produces the caller-provided defaults for the
// direct GraphQL API path: the object metadata itself, its default `name` field
// (unless it is a junction object) and the default relations to the standard
// objects (both directions, plus their backing indexes). None of these are
// flagged isSystemSideEffect — they are authorable defaults.
export const fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate =
  ({
    createObjectInput: rawCreateObjectInput,
    flatApplication,
    flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
  }: FromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreateArgs): {
    flatObjectMetadataToCreate: UniversalFlatObjectMetadata & { id: string };
    flatFieldMetadataToCreateOnObject: UniversalFlatFieldMetadata[];
    relationTargetFlatFieldMetadataToCreate: UniversalFlatFieldMetadata[];
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

    // The default field builder produces the reserved system fields AND the name
    // field, but the system fields are engine-owned side effects here: we only
    // keep the caller-provided name field and let the engine synthesize the rest.
    const defaultFlatFieldForCustomObjectMaps =
      buildDefaultFlatFieldMetadatasForCustomObject({
        flatObjectMetadata: {
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
          universalIdentifier,
        },
        skipNameField: createObjectInput.skipNameField,
      });

    const nameFlatFieldMetadata =
      defaultFlatFieldForCustomObjectMaps.fields.nameField;

    const {
      standardSourceFlatFieldMetadatas,
      standardTargetFlatFieldMetadatas,
      standardTargetFlatIndexMetadatas,
    } = buildDefaultRelationFlatFieldMetadatasForCustomObject({
      existingFlatObjectMetadataMaps,
      sourceFlatObjectMetadata: universalFlatObjectMetadataToCreate,
      flatApplication,
    });

    const flatFieldMetadataToCreateOnObject: UniversalFlatFieldMetadata[] = [
      ...(isDefined(nameFlatFieldMetadata) ? [nameFlatFieldMetadata] : []),
      ...standardSourceFlatFieldMetadatas,
    ];

    return {
      flatObjectMetadataToCreate: universalFlatObjectMetadataToCreate,
      flatFieldMetadataToCreateOnObject,
      relationTargetFlatFieldMetadataToCreate: standardTargetFlatFieldMetadatas,
      flatIndexMetadataToCreate: standardTargetFlatIndexMetadatas,
    };
  };
