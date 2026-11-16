import { type ComputedFieldValueType } from 'twenty-shared/types';
import {
  ComputedFieldExpressionError,
  getComputedFieldExpressionFieldPaths,
  isDefined,
  parseComputedFieldExpressionOrThrow,
  typeCheckComputedFieldExpressionOrThrow,
} from 'twenty-shared/utils';

import { COMPUTED_FIELD_KIND_DESCRIPTIONS } from 'src/engine/metadata-modules/computed-field/constants/computed-field-kind-descriptions.constant';
import { type UniversalComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/universal-computed-field-schema-reader.type';
import { assertComputedFieldValueTypeOrThrow } from 'src/engine/metadata-modules/computed-field/utils/assert-computed-field-value-type-or-throw.util';
import { getComputedFieldValueTypeOrThrow } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-value-type-or-throw.util';
import { resolveComputedFieldPathOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-path-or-throw.util';
import { resolveComputedFieldSlotExpressionsOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-slot-expressions-or-throw.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

// Follows the computed fields the field reads, to refuse one that ends up reading itself
const assertComputationCanBeEvaluatedOrThrow = ({
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

  const valueTypeBySlotProperty: Record<
    string,
    ComputedFieldValueType | undefined
  > = {};

  for (const {
    slot,
    expression,
    evaluatedObject,
  } of resolveComputedFieldSlotExpressionsOrThrow({
    computation,
    object,
    schemaReader,
  }).slotExpressions) {
    const resolvePath = (path: string[]) =>
      resolveComputedFieldPathOrThrow({
        path,
        object: evaluatedObject,
        schemaReader,
      });

    const { type } = typeCheckComputedFieldExpressionOrThrow({
      expression: parseComputedFieldExpressionOrThrow(expression),
      getFieldType: (path) =>
        getComputedFieldValueTypeOrThrow({
          columnType: resolvePath(path).columnType,
          readablePath: path.join('.'),
        }),
    });

    for (const path of getComputedFieldExpressionFieldPaths(expression)) {
      assertComputationCanBeEvaluatedOrThrow({
        field: resolvePath(path).field,
        schemaReader,
        findObject,
        readingFieldUniversalIdentifiers: [
          ...readingFieldUniversalIdentifiers,
          field.universalIdentifier,
        ],
      });
    }

    if (isDefined(slot.valueTypes)) {
      assertComputedFieldValueTypeOrThrow({
        valueType: type,
        expectedTypes: slot.valueTypes,
        subject: `The ${slot.property}`,
      });
    }

    valueTypeBySlotProperty[slot.property] = type;
  }

  COMPUTED_FIELD_KIND_DESCRIPTIONS[computation.kind].assertIsValidOrThrow({
    computation,
    fieldType: field.type,
    valueTypeBySlotProperty,
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
    assertComputationCanBeEvaluatedOrThrow({
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
