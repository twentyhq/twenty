import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
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

  return {
    id: {
      ...id,
      universalIdentifier: v4(),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    createdAt: {
      ...createdAt,
      universalIdentifier: v4(),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    createdBy: {
      ...createdBy,
      universalIdentifier: v4(),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    deletedAt: {
      ...deletedAt,
      universalIdentifier: v4(),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    position: {
      ...position,
      universalIdentifier: v4(),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    searchVector: {
      ...searchVector,
      universalIdentifier: v4(),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
      universalSettings: searchVectorUniversalSettings,
    },
    updatedAt: {
      ...updatedAt,
      universalIdentifier: v4(),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    updatedBy: {
      ...updatedBy,
      universalIdentifier: v4(),
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
          universalIdentifier: v4(),
          name: 'name',
          label: 'Name',
          icon: 'IconAbc',
          description: 'Name',
          isNullable: true,
          isActive: true,
          isCustom: false,
          isSystem: false,
          isUIReadOnly: false,
          defaultValue: null,
          createdAt: now,
          updatedAt: now,
          options: null,
          standardOverrides: null,
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
          universalSettings: null,
        };

  const searchVectorUniversalSettings: UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR>['universalSettings'] =
    {
      asExpression: getTsVectorColumnExpressionFromFields(
        nameField ? [nameField] : [],
      ),
      generatedType: 'STORED',
    };

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
