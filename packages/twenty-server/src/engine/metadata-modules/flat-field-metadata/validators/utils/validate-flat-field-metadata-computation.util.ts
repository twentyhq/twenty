import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isString, isUndefined } from '@sniptt/guards';
import {
  FIELD_METADATA_ROLLUP_OPERATIONS,
  type FieldMetadataComputation,
  FieldMetadataType,
} from 'twenty-shared/types';
import {
  getComputedFieldExpressionFieldPaths,
  isDefined,
  isPlainObject,
} from 'twenty-shared/utils';

import { COMPUTED_FIELD_SCALAR_TYPES } from 'src/engine/metadata-modules/computed-field/constants/computed-field-scalar-types.constant';
import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import { type ComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { type ComputedFieldValueType } from 'src/engine/metadata-modules/computed-field/types/computed-field-value-type.type';
import { compileComputedFieldExpressionToSql } from 'src/engine/metadata-modules/computed-field/utils/compile-computed-field-expression-to-sql.util';
import { getComputedFieldValueType } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-value-type.util';
import { resolveComputedFieldPathOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-path-or-throw.util';
import { resolveComputedFieldSourceRelationOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-source-relation-or-throw.util';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export type UniversalComputedFieldSchemaReader = ComputedFieldSchemaReader<
  UniversalFlatObjectMetadata,
  UniversalFlatFieldMetadata
>;

const { NUMBER, TEXT, BOOLEAN, DATE, DATE_TIME } = FieldMetadataType;

const isOptionalString = (value: unknown): value is string | undefined =>
  isUndefined(value) || isString(value);

// The computation comes from an API input or a manifest: nothing about its shape is known yet
const isFieldMetadataComputation = (
  computation: unknown,
): computation is FieldMetadataComputation => {
  if (!isPlainObject(computation)) {
    return false;
  }

  switch (computation.kind) {
    case 'FORMULA':
      return isString(computation.expression);
    case 'ROLLUP':
      return (
        isNonEmptyString(computation.relationFieldName) &&
        (FIELD_METADATA_ROLLUP_OPERATIONS as readonly unknown[]).includes(
          computation.operation,
        ) &&
        isOptionalString(computation.expression) &&
        isOptionalString(computation.filter)
      );
    default:
      return false;
  }
};

const assertValueFitsType = ({
  valueType,
  expectedTypes,
  subject,
}: {
  valueType: ComputedFieldValueType | undefined;
  expectedTypes: ComputedFieldValueType[];
  subject: string;
}): void => {
  if (isDefined(valueType) && !expectedTypes.includes(valueType)) {
    throw new ComputedFieldExpressionException(
      `${subject} is ${valueType.toLowerCase()}, expected ${expectedTypes.join(' or ').toLowerCase()}`,
    );
  }
};

// Any value reads as text, and a date and a date and time convert into each other
const ASSIGNABLE_VALUE_TYPES_BY_FIELD_TYPE: Record<
  ComputedFieldValueType,
  ComputedFieldValueType[]
> = {
  [NUMBER]: [NUMBER],
  [BOOLEAN]: [BOOLEAN],
  [DATE]: [DATE, DATE_TIME],
  [DATE_TIME]: [DATE, DATE_TIME],
  [TEXT]: [...COMPUTED_FIELD_SCALAR_TYPES],
};

// Follows the computed fields the field reads, to refuse one that ends up reading itself
const assertComputationCanBeEvaluated = ({
  field,
  schemaReader,
  findObject,
  readingFieldUniversalIdentifiers,
}: {
  field: UniversalFlatFieldMetadata;
  schemaReader: UniversalComputedFieldSchemaReader;
  findObject: (
    objectUniversalIdentifier: string,
  ) => UniversalFlatObjectMetadata | undefined;
  readingFieldUniversalIdentifiers: string[];
}): void => {
  const { computation } = field;
  const object = findObject(field.objectMetadataUniversalIdentifier);

  if (!isDefined(computation) || !isDefined(object)) {
    return;
  }

  if (readingFieldUniversalIdentifiers.includes(field.universalIdentifier)) {
    throw new ComputedFieldExpressionException(
      `"${field.name}" ends up reading itself`,
    );
  }

  const compileOn = (
    evaluatedObject: UniversalFlatObjectMetadata,
    expression: string,
  ): ComputedFieldValueType | undefined => {
    const { type } = compileComputedFieldExpressionToSql({
      expression,
      resolveField: (path) => {
        const { columnName, columnType } = resolveComputedFieldPathOrThrow({
          path,
          object: evaluatedObject,
          schemaReader,
        });

        return {
          sql: columnName,
          type: getComputedFieldValueType({
            columnType,
            readablePath: path.join('.'),
          }),
        };
      },
    });

    for (const path of getComputedFieldExpressionFieldPaths(expression)) {
      assertComputationCanBeEvaluated({
        field: resolveComputedFieldPathOrThrow({
          path,
          object: evaluatedObject,
          schemaReader,
        }).field,
        schemaReader,
        findObject,
        readingFieldUniversalIdentifiers: [
          ...readingFieldUniversalIdentifiers,
          field.universalIdentifier,
        ],
      });
    }

    return type;
  };

  const getValueType = (): ComputedFieldValueType | undefined => {
    if (computation.kind === 'FORMULA') {
      return compileOn(object, computation.expression);
    }

    const { relatedObject } = resolveComputedFieldSourceRelationOrThrow({
      relationFieldName: computation.relationFieldName,
      object,
      schemaReader,
    });

    if (isDefined(computation.filter)) {
      assertValueFitsType({
        valueType: compileOn(relatedObject, computation.filter),
        expectedTypes: [BOOLEAN],
        subject: 'The filter',
      });
    }

    if (computation.operation === 'COUNT') {
      if (isDefined(computation.expression)) {
        throw new ComputedFieldExpressionException(
          'COUNT counts the related records and takes no expression; use the filter to count some of them',
        );
      }

      return NUMBER;
    }

    if (!isDefined(computation.expression)) {
      throw new ComputedFieldExpressionException(
        `${computation.operation} needs the expression to aggregate`,
      );
    }

    const aggregatedType = compileOn(relatedObject, computation.expression);

    assertValueFitsType({
      valueType: aggregatedType,
      expectedTypes:
        computation.operation === 'SUM' || computation.operation === 'AVG'
          ? [NUMBER]
          : [NUMBER, TEXT, DATE, DATE_TIME],
      subject: `The expression of ${computation.operation}`,
    });

    return aggregatedType;
  };

  const fieldType = COMPUTED_FIELD_SCALAR_TYPES.find(
    (scalarType) => scalarType === field.type,
  );

  if (!isDefined(fieldType)) {
    throw new ComputedFieldExpressionException(
      `A computed field must be of type ${COMPUTED_FIELD_SCALAR_TYPES.join(', ')}`,
    );
  }

  assertValueFitsType({
    valueType: getValueType(),
    expectedTypes: ASSIGNABLE_VALUE_TYPES_BY_FIELD_TYPE[fieldType],
    subject: 'The computed value',
  });
};

export const getComputedFieldEvaluationError = ({
  flatFieldMetadata,
  schemaReader,
  findObject,
}: {
  flatFieldMetadata: UniversalFlatFieldMetadata;
  schemaReader: UniversalComputedFieldSchemaReader;
  findObject: (
    objectUniversalIdentifier: string,
  ) => UniversalFlatObjectMetadata | undefined;
}): string | undefined => {
  try {
    assertComputationCanBeEvaluated({
      field: flatFieldMetadata,
      schemaReader,
      findObject,
      readingFieldUniversalIdentifiers: [],
    });
  } catch (error) {
    if (error instanceof ComputedFieldExpressionException) {
      return error.message;
    }

    throw error;
  }

  return undefined;
};

export const validateFlatFieldMetadataComputation = ({
  flatFieldMetadataToValidate,
  schemaReader,
  findObject,
  isComputedFieldsEnabled,
}: {
  flatFieldMetadataToValidate: UniversalFlatFieldMetadata;
  schemaReader: UniversalComputedFieldSchemaReader;
  findObject: (
    objectUniversalIdentifier: string,
  ) => UniversalFlatObjectMetadata | undefined;
  isComputedFieldsEnabled: boolean;
}): FlatFieldMetadataValidationError[] => {
  const { computation, name } = flatFieldMetadataToValidate;

  if (!isDefined(computation)) {
    return [];
  }

  const buildError = (message: string): FlatFieldMetadataValidationError[] => [
    {
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Invalid computation for field "${name}": ${message}`,
      userFriendlyMessage: msg`The computation of this field is invalid`,
      value: computation,
    },
  ];

  if (!isComputedFieldsEnabled) {
    return buildError('computed fields are not enabled for this workspace');
  }

  if (!isFieldMetadataComputation(computation)) {
    return buildError(
      'it must be a formula with an expression, or a rollup with a relation, an operation and optional expression and filter',
    );
  }

  if (
    flatFieldMetadataToValidate.isUnique ||
    flatFieldMetadataToValidate.isSearchable ||
    isDefined(flatFieldMetadataToValidate.defaultValue)
  ) {
    return buildError(
      'a computed field stores nothing: it cannot be unique, searchable or have a default value',
    );
  }

  const evaluationError = getComputedFieldEvaluationError({
    flatFieldMetadata: flatFieldMetadataToValidate,
    schemaReader,
    findObject,
  });

  return isDefined(evaluationError) ? buildError(evaluationError) : [];
};
