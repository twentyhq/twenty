import { GraphQLISODateTime } from '@nestjs/graphql';

import { GraphQLFloat, GraphQLInt, GraphQLScalarType } from 'graphql';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { capitalize } from 'src/utils/strings/capitalize';

export type AggregationField = {
  type: GraphQLScalarType;
  description: string;
  fromField: string;
  fromFieldType: FieldMetadataType;
  fromSubField?: string;
  aggregateOperation: AGGREGATE_OPERATIONS;
};

const getSubFieldForAggregateOperation = (fieldType: FieldMetadataType) => {
  if (!isCompositeFieldMetadataType(fieldType)) {
    return undefined;
  } else {
    switch (fieldType) {
      case FieldMetadataType.CURRENCY:
        return 'amountMicros';
      case FieldMetadataType.FULL_NAME:
        return 'lastName';
      case FieldMetadataType.ADDRESS:
        return 'addressStreet1';
      case FieldMetadataType.LINKS:
        return 'linkPrimaryLinkLabel';
      case FieldMetadataType.ACTOR:
        return 'workspaceMemberId';
      case FieldMetadataType.EMAILS:
        return 'primaryEmail';
      case FieldMetadataType.PHONES:
        return 'primaryPhone';
      default:
        throw new Error(`Unsupported composite field type: ${fieldType}`);
    }
  }
};

const getColumnNameForAggregateOperation = (
  fieldName: string,
  fieldType: FieldMetadataType,
) => {
  if (!isCompositeFieldMetadataType(fieldType)) {
    return fieldName;
  } else {
    return `${fieldName}${capitalize(getSubFieldForAggregateOperation(fieldType) as string)}`;
  }
};

export const getAvailableAggregationsFromObjectFields = (
  fields: FieldMetadataInterface[],
): Record<string, AggregationField> => {
  return fields.reduce<Record<string, AggregationField>>(
    (acc, field) => {
      const columnName = getColumnNameForAggregateOperation(
        field.name,
        field.type,
      );

      const fromSubField = getSubFieldForAggregateOperation(field.type);

      acc[`countUniqueValues${capitalize(columnName)}`] = {
        type: GraphQLInt,
        description: `Number of unique values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubField,
        aggregateOperation: AGGREGATE_OPERATIONS.countUniqueValues,
      };

      acc[`countEmpty${capitalize(columnName)}`] = {
        type: GraphQLInt,
        description: `Number of empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubField,
        aggregateOperation: AGGREGATE_OPERATIONS.countEmpty,
      };

      acc[`countNotEmpty${capitalize(columnName)}`] = {
        type: GraphQLInt,
        description: `Number of non-empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubField,
        aggregateOperation: AGGREGATE_OPERATIONS.countNotEmpty,
      };

      acc[`percentageEmpty${capitalize(columnName)}`] = {
        type: GraphQLFloat,
        description: `Percentage of empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubField,
        aggregateOperation: AGGREGATE_OPERATIONS.percentageEmpty,
      };

      acc[`percentageNotEmpty${capitalize(columnName)}`] = {
        type: GraphQLFloat,
        description: `Percentage of non-empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubField,
        aggregateOperation: AGGREGATE_OPERATIONS.percentageNotEmpty,
      };

      if (field.type === FieldMetadataType.DATE_TIME) {
        acc[`min${capitalize(field.name)}`] = {
          type: GraphQLISODateTime,
          description: `Oldest date contained in the field ${field.name}`,
          fromField: field.name,
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.min,
        };

        acc[`max${capitalize(field.name)}`] = {
          type: GraphQLISODateTime,
          description: `Most recent date contained in the field ${field.name}`,
          fromField: field.name,
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.max,
        };
      }

      if (field.type === FieldMetadataType.NUMBER) {
        acc[`min${capitalize(field.name)}`] = {
          type: GraphQLFloat,
          description: `Minimum amount contained in the field ${field.name}`,
          fromField: field.name,
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.min,
        };

        acc[`max${capitalize(field.name)}`] = {
          type: GraphQLFloat,
          description: `Maximum amount contained in the field ${field.name}`,
          fromField: field.name,
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.max,
        };

        acc[`avg${capitalize(field.name)}`] = {
          type: GraphQLFloat,
          description: `Average amount contained in the field ${field.name}`,
          fromField: field.name,
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.avg,
        };

        acc[`sum${capitalize(field.name)}`] = {
          type: GraphQLFloat,
          description: `Sum of amounts contained in the field ${field.name}`,
          fromField: field.name,
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.sum,
        };
      }

      if (field.type === FieldMetadataType.CURRENCY) {
        acc[`min${capitalize(field.name)}AmountMicros`] = {
          type: GraphQLFloat,
          description: `Minimum amount contained in the field ${field.name}`,
          fromField: field.name,
          fromSubField: 'amountMicros',
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.min,
        };

        acc[`max${capitalize(field.name)}AmountMicros`] = {
          type: GraphQLFloat,
          description: `Maximal amount contained in the field ${field.name}`,
          fromField: field.name,
          fromSubField: 'amountMicros',
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.max,
        };

        acc[`sum${capitalize(field.name)}AmountMicros`] = {
          type: GraphQLFloat,
          description: `Sum of amounts contained in the field ${field.name}`,
          fromField: field.name,
          fromSubField: 'amountMicros',
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.sum,
        };

        acc[`avg${capitalize(field.name)}AmountMicros`] = {
          type: GraphQLFloat,
          description: `Average amount contained in the field ${field.name}`,
          fromField: field.name,
          fromSubField: 'amountMicros',
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.avg,
        };
      }

      return acc;
    },
    {
      totalCount: {
        type: GraphQLInt,
        description: `Total number of records in the connection`,
        fromField: 'id',
        fromFieldType: FieldMetadataType.UUID,
        aggregateOperation: AGGREGATE_OPERATIONS.count,
      },
    },
  );
};
