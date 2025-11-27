import { msg } from '@lingui/core/macro';
import deepEqual from 'deep-equal';
import { FieldMetadataType } from 'twenty-shared/types';
import { getUniqueConstraintsFields, isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  buildFieldMapsFromFlatObjectMetadata,
  type FieldMapsForObject,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ConnectObject } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';
import {
  type RelationConnectQueryConfig,
  type UniqueConstraintCondition,
} from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import { type RelationConnectQueryFieldsByEntityIndex } from 'src/engine/twenty-orm/entity-manager/types/relation-nested-query-fields-by-entity-index.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { formatCompositeField } from 'src/engine/twenty-orm/utils/format-data.util';
import { getAssociatedRelationFieldName } from 'src/engine/twenty-orm/utils/get-associated-relation-field-name.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const computeRelationConnectQueryConfigs = (
  entities: Record<string, unknown>[],
  flatObjectMetadata: FlatObjectMetadata,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>,
  relationConnectQueryFieldsByEntityIndex: RelationConnectQueryFieldsByEntityIndex,
) => {
  const allConnectQueryConfigs: Record<string, RelationConnectQueryConfig> = {};

  const fieldMaps = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  for (const [entityIndex, entity] of entities.entries()) {
    const nestedRelationConnectFields =
      relationConnectQueryFieldsByEntityIndex[entityIndex];

    if (!isDefined(nestedRelationConnectFields)) continue;

    for (const [connectFieldName, connectObject] of Object.entries(
      nestedRelationConnectFields,
    )) {
      const {
        recordToConnectCondition,
        uniqueConstraintFields,
        targetObjectNameSingular,
      } = computeRecordToConnectCondition(
        connectFieldName,
        connectObject,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
        entity,
        fieldMaps,
      );

      const connectQueryConfig = allConnectQueryConfigs[connectFieldName];

      if (isDefined(connectQueryConfig)) {
        checkUniqueConstraintsAreSameOrThrow(
          connectQueryConfig,
          uniqueConstraintFields,
        );

        allConnectQueryConfigs[connectFieldName] = updateConnectQueryConfigs(
          connectQueryConfig,
          recordToConnectCondition,
          entityIndex,
        );
      } else {
        allConnectQueryConfigs[connectFieldName] = createConnectQueryConfig(
          connectFieldName,
          recordToConnectCondition,
          uniqueConstraintFields,
          targetObjectNameSingular,
          entityIndex,
        );
      }
    }
  }

  return Object.values(allConnectQueryConfigs);
};

const updateConnectQueryConfigs = (
  connectQueryConfig: RelationConnectQueryConfig,
  recordToConnectCondition: UniqueConstraintCondition,
  entityIndex: number,
) => {
  return {
    ...connectQueryConfig,
    recordToConnectConditions: [
      ...connectQueryConfig.recordToConnectConditions,
      recordToConnectCondition,
    ],
    recordToConnectConditionByEntityIndex: {
      ...connectQueryConfig.recordToConnectConditionByEntityIndex,
      [entityIndex]: recordToConnectCondition,
    },
  };
};

const createConnectQueryConfig = (
  connectFieldName: string,
  recordToConnectCondition: UniqueConstraintCondition,
  uniqueConstraintFields: FlatFieldMetadata<FieldMetadataType>[],
  targetObjectNameSingular: string,
  entityIndex: number,
) => {
  return {
    targetObjectName: targetObjectNameSingular,
    recordToConnectConditions: [recordToConnectCondition],
    relationFieldName: getAssociatedRelationFieldName(connectFieldName),
    connectFieldName,
    uniqueConstraintFields,
    recordToConnectConditionByEntityIndex: {
      [entityIndex]: recordToConnectCondition,
    },
  };
};

const computeRecordToConnectCondition = (
  connectFieldName: string,
  connectObject: ConnectObject,
  flatObjectMetadata: FlatObjectMetadata,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>,
  entity: Record<string, unknown>,
  fieldMaps: FieldMapsForObject,
): {
  recordToConnectCondition: UniqueConstraintCondition;
  uniqueConstraintFields: FlatFieldMetadata<FieldMetadataType>[];
  targetObjectNameSingular: string;
} => {
  const field =
    flatFieldMetadataMaps.byId[fieldMaps.fieldIdByName[connectFieldName]];

  if (
    !isDefined(field) ||
    (!isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
      !isFieldMetadataEntityOfType(field, FieldMetadataType.MORPH_RELATION)) ||
    field.settings?.relationType !== RelationType.MANY_TO_ONE
  ) {
    const objectMetadataNameSingular = flatObjectMetadata.nameSingular;

    throw new TwentyORMException(
      `Connect is not allowed for ${connectFieldName} on ${flatObjectMetadata.nameSingular}`,
      TwentyORMExceptionCode.CONNECT_NOT_ALLOWED,
      {
        userFriendlyMessage: msg`Connect is not allowed for ${connectFieldName} on ${objectMetadataNameSingular}`,
      },
    );
  }
  checkNoRelationFieldConflictOrThrow(entity, connectFieldName);

  const targetObjectMetadata =
    flatObjectMetadataMaps.byId[field.relationTargetObjectMetadataId || ''];

  if (!isDefined(targetObjectMetadata)) {
    throw new TwentyORMException(
      `Target object metadata not found for ${connectFieldName}`,
      TwentyORMExceptionCode.MALFORMED_METADATA,
      {
        userFriendlyMessage: msg`Target object metadata not found for ${connectFieldName}`,
      },
    );
  }

  const uniqueConstraintFields = checkUniqueConstraintFullyPopulated(
    targetObjectMetadata,
    flatFieldMetadataMaps,
    flatIndexMaps,
    connectObject,
    connectFieldName,
  );

  return {
    recordToConnectCondition: computeUniqueConstraintCondition(
      uniqueConstraintFields,
      connectObject,
    ),
    uniqueConstraintFields,
    targetObjectNameSingular: targetObjectMetadata.nameSingular,
  };
};

const checkUniqueConstraintFullyPopulated = (
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>,
  connectObject: ConnectObject,
  connectFieldName: string,
) => {
  const fields = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  const indexMetadatas = flatObjectMetadata.indexMetadataIds
    .map((indexId) => flatIndexMaps.byId[indexId])
    .filter(isDefined)
    .map((index) => ({
      id: index.id,
      isUnique: index.isUnique,
      indexFieldMetadatas: index.flatIndexFieldMetadatas.map(
        (fieldMetadata) => ({
          fieldMetadataId: fieldMetadata.fieldMetadataId,
        }),
      ),
    }));

  const uniqueConstraintsFields = getUniqueConstraintsFields<
    FlatFieldMetadata,
    {
      id: string;
      indexMetadatas: typeof indexMetadatas;
      fields: FlatFieldMetadata[];
    }
  >({
    id: flatObjectMetadata.id,
    indexMetadatas,
    fields,
  });

  const hasUniqueConstraintFieldFullyPopulated = uniqueConstraintsFields.some(
    (uniqueConstraintFields) =>
      uniqueConstraintFields.every((uniqueConstraintField) =>
        isDefined(connectObject.connect.where[uniqueConstraintField.name]),
      ),
  );

  if (!hasUniqueConstraintFieldFullyPopulated) {
    throw new TwentyORMException(
      `Missing required fields: at least one unique constraint have to be fully populated for '${connectFieldName}'.`,
      TwentyORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR,
      {
        userFriendlyMessage: msg`Missing required fields: at least one unique constraint have to be fully populated for '${connectFieldName}'.`,
      },
    );
  }

  return Object.keys(connectObject.connect.where).map((key) => {
    const field = uniqueConstraintsFields
      .flat()
      .find((uniqueConstraintField) => uniqueConstraintField.name === key);

    if (!isDefined(field)) {
      throw new TwentyORMException(
        `Field ${key} is not a unique constraint field for '${connectFieldName}'.`,
        TwentyORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR,
      );
    }

    return field;
  });
};

const checkNoRelationFieldConflictOrThrow = (
  entity: Record<string, unknown>,
  fieldName: string,
) => {
  const hasRelationFieldConflict =
    isDefined(entity[fieldName]) && isDefined(entity[`${fieldName}Id`]);

  if (hasRelationFieldConflict) {
    throw new TwentyORMException(
      `${fieldName} and ${fieldName}Id cannot be both provided.`,
      TwentyORMExceptionCode.CONNECT_NOT_ALLOWED,
      {
        userFriendlyMessage: msg`${fieldName} and ${fieldName}Id cannot be both provided.`,
      },
    );
  }
};

const computeUniqueConstraintCondition = (
  uniqueConstraintFields: FlatFieldMetadata<FieldMetadataType>[],
  connectObject: ConnectObject,
): UniqueConstraintCondition => {
  return uniqueConstraintFields.reduce((acc, uniqueConstraintField) => {
    if (isCompositeFieldMetadataType(uniqueConstraintField.type)) {
      return [
        ...acc,
        ...Object.entries(
          formatCompositeField(
            connectObject.connect.where[uniqueConstraintField.name],
            uniqueConstraintField,
          ),
        ),
      ];
    }

    return [
      ...acc,
      [
        uniqueConstraintField.name,
        connectObject.connect.where[uniqueConstraintField.name],
      ],
    ];
  }, []);
};

const checkUniqueConstraintsAreSameOrThrow = (
  relationConnectQueryConfig: RelationConnectQueryConfig,
  uniqueConstraintFields: FlatFieldMetadata<FieldMetadataType>[],
) => {
  if (
    !deepEqual(
      relationConnectQueryConfig.uniqueConstraintFields,
      uniqueConstraintFields,
    )
  ) {
    const connectFieldName = relationConnectQueryConfig.connectFieldName;

    throw new TwentyORMException(
      `Expected the same constraint fields to be used consistently across all operations for ${relationConnectQueryConfig.connectFieldName}.`,
      TwentyORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR,
      {
        userFriendlyMessage: msg`Expected the same constraint fields to be used consistently across all operations for ${connectFieldName}.`,
      },
    );
  }
};
