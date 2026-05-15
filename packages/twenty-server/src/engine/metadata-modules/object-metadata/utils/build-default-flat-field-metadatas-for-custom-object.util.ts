import { FieldMetadataType } from 'twenty-shared/types';
import { v4, v5 } from 'uuid';

import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';

// Namespace used to derive deterministic v5 UUIDs for an object's
// standard system fields (id, createdAt, createdBy, deletedAt, position,
// searchVector, updatedAt, updatedBy). Same approach as
// `NAVIGATION_COMMAND_UUID_NAMESPACE` for navigation command menu items:
// any consumer that can compute the seed `${objectMetadataUniversalIdentifier}/${name}`
// can reproduce the exact same universalIdentifier, which is what lets
// the app-install diff path emit zero updates for system fields it does
// not control.
export const SYSTEM_FIELD_UUID_NAMESPACE =
  '7c8e0e1c-2d4f-4ab1-b25b-9d3a8d6a1f02';

export const computeSystemFieldUniversalIdentifier = ({
  objectMetadataUniversalIdentifier,
  name,
}: {
  objectMetadataUniversalIdentifier: string;
  name: string;
}): string =>
  v5(
    `${objectMetadataUniversalIdentifier}/${name}`,
    SYSTEM_FIELD_UUID_NAMESPACE,
  );
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

  // Each system field's universalIdentifier is derived deterministically
  // from `${objectMetadataUniversalIdentifier}/${name}` so this scaffolder
  // produces the same UUIDs every time, for both runtime object creation
  // and manifest-derived "TO" computation. That alignment is what makes
  // app-install diffs empty for system fields the app doesn't define.
  const systemFieldUniversalIdentifier = (name: string): string =>
    computeSystemFieldUniversalIdentifier({
      objectMetadataUniversalIdentifier,
      name,
    });

  return {
    id: {
      ...id,
      universalIdentifier: systemFieldUniversalIdentifier(id.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    createdAt: {
      ...createdAt,
      universalIdentifier: systemFieldUniversalIdentifier(createdAt.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    createdBy: {
      ...createdBy,
      universalIdentifier: systemFieldUniversalIdentifier(createdBy.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    deletedAt: {
      ...deletedAt,
      universalIdentifier: systemFieldUniversalIdentifier(deletedAt.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    position: {
      ...position,
      universalIdentifier: systemFieldUniversalIdentifier(position.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    searchVector: {
      ...searchVector,
      universalIdentifier: systemFieldUniversalIdentifier(searchVector.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
      universalSettings: searchVectorUniversalSettings,
    },
    updatedAt: {
      ...updatedAt,
      universalIdentifier: systemFieldUniversalIdentifier(updatedAt.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    updatedBy: {
      ...updatedBy,
      universalIdentifier: systemFieldUniversalIdentifier(updatedBy.name),
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
          fieldPermissionUniversalIdentifiers: [],
          universalSettings: null,
          viewSortUniversalIdentifiers: [],
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
