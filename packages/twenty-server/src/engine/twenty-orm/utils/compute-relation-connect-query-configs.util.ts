import deepEqual from 'deep-equal';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { getUniqueConstraintsFields } from 'src/engine/metadata-modules/index-metadata/utils/getUniqueConstraintsFields.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { ConnectObject } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-relation-connect.type';
import {
  RelationConnectQueryConfig,
  uniqueConstraintCondition,
} from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import { formatCompositeField } from 'src/engine/twenty-orm/utils/format-data.util';
import { isFieldMetadataInterfaceOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

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
      const field =
        objectMetadata.fieldsById[
          objectMetadata.fieldIdByName[connectFieldName]
        ];

      if (
        !isFieldMetadataInterfaceOfType(field, FieldMetadataType.RELATION) ||
        field.settings?.relationType !== RelationType.MANY_TO_ONE
      ) {
        throw new Error(
          `Connect is not allowed for ${connectFieldName} on ${objectMetadata.nameSingular}`,
        );
      }
      checkNoRelationFieldConflictOrThrow(entity, connectFieldName);

      const targetObjectMetadata =
        objectMetadataMap.byId[field.relationTargetObjectMetadataId || ''];

      if (!isDefined(targetObjectMetadata)) {
        throw new Error(
          `Target object metadata not found for ${connectFieldName}`,
        );
      }

      const uniqueConstraintFields = checkUniqueConstraintFullyPopulated(
        targetObjectMetadata,
        connectObject,
        connectFieldName,
      );

      const recordToConnectCondition = computeUniqueConstraintCondition(
        uniqueConstraintFields,
        connectObject,
      );

      if (isDefined(allConnectQueryConfigs[connectFieldName])) {
        checkUniqueConstraintsAreSameOrThrow(
          allConnectQueryConfigs[connectFieldName],
          uniqueConstraintFields,
        );

        allConnectQueryConfigs[connectFieldName].recordToConnectConditions.push(
          recordToConnectCondition,
        );
        allConnectQueryConfigs[
          connectFieldName
        ].recordToConnectConditonByEntityIndex[entityIndex] =
          recordToConnectCondition;
      } else {
        allConnectQueryConfigs[connectFieldName] = {
          targetObjectName: targetObjectMetadata.nameSingular,
          recordToConnectConditions: [recordToConnectCondition],
          relationFieldName: `${connectFieldName}Id`,
          connectFieldName,
          uniqueConstraintFields,
          recordToConnectConditonByEntityIndex: {
            [entityIndex]: recordToConnectCondition,
          },
        };
      }
    }
  }

  return allConnectQueryConfigs;
};

const extractConnectFields = (
  entity: Record<string, unknown>,
): { [connectFieldName: string]: ConnectObject }[] => {
  const connectFields: { [entityKey: number]: ConnectObject }[] = [];

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
  const uniqueConstraintsFields = getUniqueConstraintsFields({
    ...objectMetadata,
    fields: Object.values(objectMetadata.fieldsById),
  });

  const uniqueConstraintFieldFullyPopulated = uniqueConstraintsFields.find(
    (uniqueConstraintFields) =>
      uniqueConstraintFields.every((uniqueConstraintField) =>
        isDefined(connectObject.connect.where[uniqueConstraintField.name]),
      ),
  );

  if (!isDefined(uniqueConstraintFieldFullyPopulated)) {
    throw new Error(
      `Missing required fields: unique constraint fields are not all populated for '${connectFieldName}'.`,
    );
  }

  if (
    uniqueConstraintFieldFullyPopulated.length !==
    Object.keys(connectObject.connect.where).length
  ) {
    throw new Error(
      `Too many fields provided for connect field '${connectFieldName}'. Only fields from one unique constraint are allowed.`,
    );
  }

  return uniqueConstraintFieldFullyPopulated;
};

const checkNoRelationFieldConflictOrThrow = (
  entity: Record<string, unknown>,
  fieldName: string,
) => {
  const hasRelationFieldConflict =
    isDefined(entity[fieldName]) && isDefined(entity[`${fieldName}Id`]);

  if (hasRelationFieldConflict) {
    throw new Error(`${fieldName} and ${fieldName}Id cannot be both provided.`);
  }
};

const computeUniqueConstraintCondition = (
  uniqueConstraintFields: FieldMetadataInterface<FieldMetadataType>[],
  connectObject: ConnectObject,
): uniqueConstraintCondition => {
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
  uniqueConstraintFields: FieldMetadataInterface<FieldMetadataType>[],
) => {
  if (
    !deepEqual(
      relationConnectQueryConfig.uniqueConstraintFields,
      uniqueConstraintFields,
    )
  ) {
    throw new Error(
      `Expected the same constraint fields to be used consistently across all operations for ${relationConnectQueryConfig.connectFieldName}.`,
    );
  }
};
