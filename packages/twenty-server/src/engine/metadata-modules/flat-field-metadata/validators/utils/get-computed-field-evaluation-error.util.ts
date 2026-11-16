import { COMPUTED_FIELD_VALUE_TYPES } from 'twenty-shared/constants';
import {
  type ComputedFieldValueType,
  FieldMetadataType,
} from 'twenty-shared/types';
import {
  ComputedFieldExpressionError,
  getComputedFieldExpressionFieldPaths,
  isDefined,
  parseComputedFieldExpressionOrThrow,
  typeCheckComputedFieldExpressionOrThrow,
} from 'twenty-shared/utils';

import { type UniversalComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/universal-computed-field-schema-reader.type';
import { getComputedFieldValueTypeOrThrow } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-value-type-or-throw.util';
import { resolveComputedFieldPathOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-path-or-throw.util';
import { resolveComputedFieldSourceRelationOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-source-relation-or-throw.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

const { NUMBER, TEXT, BOOLEAN, DATE, DATE_TIME } = FieldMetadataType;

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
    throw new ComputedFieldExpressionError(
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
  [TEXT]: [...COMPUTED_FIELD_VALUE_TYPES],
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
    throw new ComputedFieldExpressionError(
      `"${field.name}" ends up reading itself`,
    );
  }

  const compileOn = (
    evaluatedObject: UniversalFlatObjectMetadata,
    expression: string,
  ): ComputedFieldValueType | undefined => {
    const { type } = typeCheckComputedFieldExpressionOrThrow({
      expression: parseComputedFieldExpressionOrThrow(expression),
      getFieldType: (path) =>
        getComputedFieldValueTypeOrThrow({
          columnType: resolveComputedFieldPathOrThrow({
            path,
            object: evaluatedObject,
            schemaReader,
          }).columnType,
          readablePath: path.join('.'),
        }),
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
        throw new ComputedFieldExpressionError(
          'COUNT counts the related records and takes no expression; use the filter to count some of them',
        );
      }

      return NUMBER;
    }

    if (!isDefined(computation.expression)) {
      throw new ComputedFieldExpressionError(
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

  const fieldType = COMPUTED_FIELD_VALUE_TYPES.find(
    (scalarType) => scalarType === field.type,
  );

  if (!isDefined(fieldType)) {
    throw new ComputedFieldExpressionError(
      `A computed field must be of type ${COMPUTED_FIELD_VALUE_TYPES.join(', ')}`,
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
    if (error instanceof ComputedFieldExpressionError) {
      return error.message;
    }

    throw error;
  }

  return undefined;
};
