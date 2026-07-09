import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type BuildDefaultFlatFieldMetadataForCustomObjectArgs = {
  flatObjectMetadata: Pick<
    UniversalFlatObjectMetadata,
    'universalIdentifier' | 'applicationUniversalIdentifier'
  >;
  skipNameField?: boolean;
};

export type DefaultFlatFieldForCustomObjectMaps = ReturnType<
  typeof buildDefaultFlatFieldMetadatasForCustomObject
>;

const buildObjectSystemFlatFieldMetadatas = ({
  applicationUniversalIdentifier,
  objectMetadataUniversalIdentifier,
  now,
  searchVectorUniversalSettings,
}: {
  applicationUniversalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  now: string;
  searchVectorUniversalSettings: UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR>['universalSettings'];
}) => {
  const {
    createdAt,
    createdBy,
    deletedAt,
    id,
    position,
    searchVector,
    updatedAt,
    updatedBy,
  } = PARTIAL_SYSTEM_FLAT_FIELD_METADATAS;

  const computeFieldUniversalIdentifier = (name: string) =>
    getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadataUniversalIdentifier,
      name,
    });

  return {
    id: {
      ...id,
      universalIdentifier: computeFieldUniversalIdentifier(id.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    createdAt: {
      ...createdAt,
      universalIdentifier: computeFieldUniversalIdentifier(createdAt.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    createdBy: {
      ...createdBy,
      universalIdentifier: computeFieldUniversalIdentifier(createdBy.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    deletedAt: {
      ...deletedAt,
      universalIdentifier: computeFieldUniversalIdentifier(deletedAt.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    position: {
      ...position,
      universalIdentifier: computeFieldUniversalIdentifier(position.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    searchVector: {
      ...searchVector,
      universalIdentifier: computeFieldUniversalIdentifier(searchVector.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
      universalSettings: searchVectorUniversalSettings,
    },
    updatedAt: {
      ...updatedAt,
      universalIdentifier: computeFieldUniversalIdentifier(updatedAt.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    updatedBy: {
      ...updatedBy,
      universalIdentifier: computeFieldUniversalIdentifier(updatedBy.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
  } as const satisfies Record<string, UniversalFlatFieldMetadata>;
};

// This could be replaced totally by an import schema + its transpilation when it's ready
export const buildDefaultFlatFieldMetadatasForCustomObject = ({
  flatObjectMetadata: {
    applicationUniversalIdentifier,
    universalIdentifier: objectMetadataUniversalIdentifier,
  },
  skipNameField = false,
}: BuildDefaultFlatFieldMetadataForCustomObjectArgs) => {
  const now = new Date().toISOString();

  const nameField: UniversalFlatFieldMetadata<FieldMetadataType.TEXT> | null =
    skipNameField
      ? null
      : {
          type: FieldMetadataType.TEXT,
          isLabelSyncedWithName: false,
          isUnique: false,
          universalIdentifier: getFieldUniversalIdentifier({
            applicationUniversalIdentifier,
            objectUniversalIdentifier: objectMetadataUniversalIdentifier,
            name: 'name',
          }),
          name: 'name',
          label: 'Name',
          icon: 'IconAbc',
          description: 'Name',
          isNullable: true,
          isActive: true,
          isSystem: false,
          isSystemSideEffect: true,
          isUIEditable: true,
          defaultValue: null,
          createdAt: now,
          updatedAt: now,
          options: null,
          overrides: null,
          morphId: null,
          applicationUniversalIdentifier,
          objectMetadataUniversalIdentifier,
          relationTargetObjectMetadataUniversalIdentifier: null,
          relationTargetFieldMetadataUniversalIdentifier: null,
          viewFilterUniversalIdentifiers: [],
          viewFieldUniversalIdentifiers: [],
          kanbanAggregateOperationViewUniversalIdentifiers: [],
          calendarViewUniversalIdentifiers: [],
          mainGroupByFieldMetadataViewUniversalIdentifiers: [],
          fieldPermissionUniversalIdentifiers: [],
          universalSettings: null,
          viewSortUniversalIdentifiers: [],
          searchFieldMetadataUniversalIdentifiers: [],
        };

  const searchVectorUniversalSettings: UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR>['universalSettings'] =
    null;

  return {
    fields: {
      ...(nameField && { nameField }),
      ...buildObjectSystemFlatFieldMetadatas({
        applicationUniversalIdentifier,
        objectMetadataUniversalIdentifier,
        now,
        searchVectorUniversalSettings,
      }),
    },
  } as const satisfies {
    fields: Record<string, UniversalFlatFieldMetadata>;
  };
};
