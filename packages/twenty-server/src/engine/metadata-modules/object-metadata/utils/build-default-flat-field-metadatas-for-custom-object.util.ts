import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type BuildFlatFieldMetadataForCustomObjectArgs = {
  flatObjectMetadata: Pick<
    UniversalFlatObjectMetadata,
    'universalIdentifier' | 'applicationUniversalIdentifier'
  >;
};

type BuildDefaultFlatFieldMetadataForCustomObjectArgs =
  BuildFlatFieldMetadataForCustomObjectArgs & {
    skipNameField?: boolean;
  };

export type DefaultFlatFieldForCustomObjectMaps = ReturnType<
  typeof buildDefaultFlatFieldMetadatasForCustomObject
>;

export const buildReservedSystemFlatFieldMetadatasForCustomObject = ({
  flatObjectMetadata: {
    applicationUniversalIdentifier,
    universalIdentifier: objectMetadataUniversalIdentifier,
  },
}: BuildFlatFieldMetadataForCustomObjectArgs): Record<
  string,
  UniversalFlatFieldMetadata
> => {
  const now = new Date().toISOString();

  const {
    createdAt,
    createdBy,
    deletedAt,
    id,
    position,
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

export const buildSearchVectorFlatFieldMetadataForCustomObject = ({
  flatObjectMetadata: {
    applicationUniversalIdentifier,
    universalIdentifier: objectMetadataUniversalIdentifier,
  },
}: BuildFlatFieldMetadataForCustomObjectArgs): UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR> => {
  const now = new Date().toISOString();

  const { searchVector } = PARTIAL_SYSTEM_FLAT_FIELD_METADATAS;

  return {
    ...searchVector,
    universalIdentifier: getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadataUniversalIdentifier,
      name: searchVector.name,
    }),
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    createdAt: now,
    updatedAt: now,
    universalSettings: null,
  };
};

export const buildNameFlatFieldMetadataForCustomObject = ({
  flatObjectMetadata: {
    applicationUniversalIdentifier,
    universalIdentifier: objectMetadataUniversalIdentifier,
  },
}: BuildFlatFieldMetadataForCustomObjectArgs): UniversalFlatFieldMetadata<FieldMetadataType.TEXT> => {
  const now = new Date().toISOString();

  return {
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
    isSystemSideEffect: false,
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
};

export const buildDefaultFlatFieldMetadatasForCustomObject = ({
  flatObjectMetadata,
  skipNameField = false,
}: BuildDefaultFlatFieldMetadataForCustomObjectArgs) => {
  const nameField = skipNameField
    ? null
    : buildNameFlatFieldMetadataForCustomObject({ flatObjectMetadata });

  return {
    fields: {
      ...(nameField && { nameField }),
      ...buildReservedSystemFlatFieldMetadatasForCustomObject({
        flatObjectMetadata,
      }),
      searchVector: buildSearchVectorFlatFieldMetadataForCustomObject({
        flatObjectMetadata,
      }),
    },
  } as const satisfies {
    fields: Record<string, UniversalFlatFieldMetadata>;
  };
};
