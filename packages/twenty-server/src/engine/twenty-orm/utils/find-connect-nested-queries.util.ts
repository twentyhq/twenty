import deepEqual from 'deep-equal';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { getUniqueConstraintsFields } from 'src/engine/metadata-modules/index-metadata/utils/getUniqueConstraintsFields.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { formatCompositeField } from 'src/engine/twenty-orm/utils/format-data.util';
import { isFieldMetadataInterfaceOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

type uniqueFieldCondition = [field: string, value: string];

type uniqueConstraintCondition = uniqueFieldCondition[];

// Type definitions for connect structures
type ConnectWhereValue = string | Record<string, string>;

type ConnectWhere = Record<string, ConnectWhereValue>;

type ConnectObject = {
  connect: {
    where: ConnectWhere;
  };
};

// Type guard to check if a value has the connect structure
const hasConnectStructure = (value: unknown): value is ConnectObject => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check if it has a 'connect' property
  if (
    !obj.connect ||
    typeof obj.connect !== 'object' ||
    Array.isArray(obj.connect)
  ) {
    return false;
  }

  const connect = obj.connect as Record<string, unknown>;

  // Check if connect has a 'where' property
  if (
    !connect.where ||
    typeof connect.where !== 'object' ||
    Array.isArray(connect.where)
  ) {
    return false;
  }

  const where = connect.where as Record<string, unknown>;

  // Check if where has at least one property and all values are strings or objects with string values
  const whereKeys = Object.keys(where);

  if (whereKeys.length === 0) {
    return false;
  }

  return whereKeys.every((key) => {
    const whereValue = where[key];

    if (typeof whereValue === 'string') {
      return true;
    }
    if (
      whereValue &&
      typeof whereValue === 'object' &&
      !Array.isArray(whereValue)
    ) {
      const subObj = whereValue as Record<string, unknown>;

      return Object.values(subObj).every(
        (subValue) => typeof subValue === 'string',
      );
    }

    return false;
  });
};

export const extractConnectFields = (
  entity: Record<string, unknown>,
): { [connectFieldName: string]: ConnectObject }[] => {
  const connectFields: { [entityKey: string]: ConnectObject }[] = [];

  for (const [key, value] of Object.entries(entity)) {
    if (hasConnectStructure(value)) {
      connectFields.push({ [key]: value });
    }
  }

  return connectFields;
};

export type ConnectNestedQuery = {
  targetObjectName: string;
  recordToConnectConditions: uniqueConstraintCondition[];
  relationFieldName: string;
  connectFieldName: string;
  uniqueConstraintFields: FieldMetadataInterface<FieldMetadataType>[];
  recordToConnectConditonByEntityIndex: {
    [entityIndex: number]: uniqueConstraintCondition;
  };
};

export const findConnectNestedQueries = (
  entities: Record<string, unknown>[],
  objectMetadata: ObjectMetadataItemWithFieldMaps,
  objectMetadataMap: ObjectMetadataMaps,
) => {
  const allConnectNestedQueries: Record<string, ConnectNestedQuery> = {};

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

      if (isDefined(allConnectNestedQueries[connectFieldName])) {
        checkUniqueConstraintIsSameOrThrow(
          allConnectNestedQueries[connectFieldName],
          uniqueConstraintFields,
        );

        allConnectNestedQueries[
          connectFieldName
        ].recordToConnectConditions.push(recordToConnectCondition);
        allConnectNestedQueries[
          connectFieldName
        ].recordToConnectConditonByEntityIndex[entityIndex] =
          recordToConnectCondition;
      } else {
        allConnectNestedQueries[connectFieldName] = {
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

  return allConnectNestedQueries;
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
      `Missing required values: All fields in at least one unique constraint must be provided for '${connectFieldName}'`,
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
    throw new Error(
      `${fieldName} and ${fieldName}Id cannot be simultaneously set`,
    );
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

const checkUniqueConstraintIsSameOrThrow = (
  connectNestedQuery: ConnectNestedQuery,
  uniqueConstraintFields: FieldMetadataInterface<FieldMetadataType>[],
) => {
  if (
    !deepEqual(
      connectNestedQuery.uniqueConstraintFields,
      uniqueConstraintFields,
    )
  ) {
    throw new Error(
      `Unique constraint fields are different for ${connectNestedQuery.connectFieldName}`,
    );
  }
};
