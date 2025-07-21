import { t } from '@lingui/core/macro';
import deepEqual from 'deep-equal';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { getUniqueConstraintsFields } from 'src/engine/metadata-modules/index-metadata/utils/getUniqueConstraintsFields.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { ConnectObject } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-relation-connect.type';
import {
  RelationConnectQueryConfig,
  UniqueConstraintCondition,
} from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { formatCompositeField } from 'src/engine/twenty-orm/utils/format-data.util';
import { getAssociatedRelationFieldName } from 'src/engine/twenty-orm/utils/get-associated-relation-field-name.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const computeRelationConnectQueryConfigs = (
  entities: Record<string, unknown>[],
  objectMetadata: ObjectMetadataItemWithFieldMaps,
  objectMetadataMap: ObjectMetadataMaps,
) => {
  const allConnectQueryConfigs: Record<string, RelationConnectQueryConfig> = {};

  for (const [entityIndex, entity] of entities.entries()) {
    const connectFields = extractConnectFields(entity);

    if (connectFields.length === 0) {
      continue;
    }

    for (const connectField of connectFields) {
      const [connectFieldName, connectObject] = Object.entries(connectField)[0];

      const {
        recordToConnectCondition,
        uniqueConstraintFields,
        targetObjectNameSingular,
      } = computeRecordToConnectCondition(
        connectFieldName,
        connectObject,
        objectMetadata,
        objectMetadataMap,
        entity,
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

  return allConnectQueryConfigs;
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
  uniqueConstraintFields: FieldMetadataEntity<FieldMetadataType>[],
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
  objectMetadata: ObjectMetadataItemWithFieldMaps,
  objectMetadataMap: ObjectMetadataMaps,
  entity: Record<string, unknown>,
): {
  recordToConnectCondition: UniqueConstraintCondition;
  uniqueConstraintFields: FieldMetadataEntity<FieldMetadataType>[];
  targetObjectNameSingular: string;
} => {
  const field =
    objectMetadata.fieldsById[objectMetadata.fieldIdByName[connectFieldName]];

  if (
    !isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) ||
    field.settings?.relationType !== RelationType.MANY_TO_ONE
  ) {
    const objectMetadataNameSingular = objectMetadata.nameSingular;

    throw new TwentyORMException(
      `Connect is not allowed for ${connectFieldName} on ${objectMetadata.nameSingular}`,
      TwentyORMExceptionCode.CONNECT_NOT_ALLOWED,
      {
        userFriendlyMessage: t`Connect is not allowed for ${connectFieldName} on ${objectMetadataNameSingular}`,
      },
    );
  }
  checkNoRelationFieldConflictOrThrow(entity, connectFieldName);

  const targetObjectMetadata =
    objectMetadataMap.byId[field.relationTargetObjectMetadataId || ''];

  if (!isDefined(targetObjectMetadata)) {
    throw new TwentyORMException(
      `Target object metadata not found for ${connectFieldName}`,
      TwentyORMExceptionCode.MALFORMED_METADATA,
      {
        userFriendlyMessage: t`Target object metadata not found for ${connectFieldName}`,
      },
    );
  }

  const uniqueConstraintFields = checkUniqueConstraintFullyPopulated(
    targetObjectMetadata,
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

const extractConnectFields = (
  entity: Record<string, unknown>,
): { [connectFieldName: string]: ConnectObject }[] => {
  const connectFields: { [entityKey: string]: ConnectObject }[] = [];

  for (const [key, value] of Object.entries(entity)) {
    if (hasRelationConnect(value)) {
      connectFields.push({ [key]: value });
    }
  }

  return connectFields;
};

const hasRelationConnect = (value: unknown): value is ConnectObject => {
  if (!isDefined(value) || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (!isDefined(obj.connect) || typeof obj.connect !== 'object') {
    return false;
  }

  const connect = obj.connect as Record<string, unknown>;

  if (!isDefined(connect.where) || typeof connect.where !== 'object') {
    return false;
  }

  const where = connect.where as Record<string, unknown>;

  const whereKeys = Object.keys(where);

  if (whereKeys.length === 0) {
    return false;
  }

  return whereKeys.every((key) => {
    const whereValue = where[key];

    if (typeof whereValue === 'string') {
      return true;
    }
    if (whereValue && typeof whereValue === 'object') {
      const subObj = whereValue as Record<string, unknown>;

      return Object.values(subObj).every(
        (subValue) => typeof subValue === 'string',
      );
    }

    return false;
  });
};

const checkUniqueConstraintFullyPopulated = (
  objectMetadata: ObjectMetadataItemWithFieldMaps,
  connectObject: ConnectObject,
  connectFieldName: string,
) => {
  const uniqueConstraintsFields = getUniqueConstraintsFields<
    FieldMetadataEntity,
    ObjectMetadataInterface
  >({
    ...objectMetadata,
    fields: Object.values(objectMetadata.fieldsById),
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
        userFriendlyMessage: t`Missing required fields: at least one unique constraint have to be fully populated for '${connectFieldName}'.`,
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
        userFriendlyMessage: t`${fieldName} and ${fieldName}Id cannot be both provided.`,
      },
    );
  }
};

const computeUniqueConstraintCondition = (
  uniqueConstraintFields: FieldMetadataEntity<FieldMetadataType>[],
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
  uniqueConstraintFields: FieldMetadataEntity<FieldMetadataType>[],
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
        userFriendlyMessage: t`Expected the same constraint fields to be used consistently across all operations for ${connectFieldName}.`,
      },
    );
  }
};
