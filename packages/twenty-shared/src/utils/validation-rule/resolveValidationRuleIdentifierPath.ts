import { VALIDATION_RULE_NOW_VARIABLE_NAME } from '@/constants/ValidationRuleNowVariableName';
import { compositeTypeDefinitions } from '@/types/composite-types/composite-type-definitions';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { type ValidationRuleResolvedIdentifierPath } from '@/types/ValidationRuleResolvedIdentifierPath';
import { isValidationRuleFieldSymbol } from '@/utils/validation-rule/isValidationRuleFieldSymbol';
import { isDefined } from '@/utils/validation/isDefined';

type ResolveValidationRuleIdentifierPathResult =
  | { isResolved: true; resolvedPath: ValidationRuleResolvedIdentifierPath }
  | { isResolved: false; errorMessage: string };

type ResolveFieldSegmentResult =
  | { isResolved: true; field: ValidationRuleFieldDescriptor }
  | { isResolved: false; errorMessage: string };

const resolveFieldSegment = ({
  segment,
  candidateFields,
  bindings,
  acceptsFieldNames,
  unknownFieldErrorMessage,
}: {
  segment: string;
  candidateFields: ValidationRuleFieldDescriptor[];
  bindings: ValidationRuleBindings;
  acceptsFieldNames: boolean;
  unknownFieldErrorMessage: string;
}): ResolveFieldSegmentResult => {
  if (acceptsFieldNames && !isValidationRuleFieldSymbol(segment)) {
    const field = candidateFields.find(
      (candidate) => candidate.name === segment,
    );

    return isDefined(field)
      ? { isResolved: true, field }
      : { isResolved: false, errorMessage: unknownFieldErrorMessage };
  }

  const boundUniversalIdentifier = bindings[segment];

  if (!isDefined(boundUniversalIdentifier)) {
    return {
      isResolved: false,
      errorMessage: `"${segment}" is not bound to a field`,
    };
  }

  const field = candidateFields.find(
    (candidate) => candidate.universalIdentifier === boundUniversalIdentifier,
  );

  return isDefined(field)
    ? { isResolved: true, field }
    : {
        isResolved: false,
        errorMessage: `"${segment}" refers to a field that was deleted or deactivated`,
      };
};

const resolveSubfieldSegments = ({
  field,
  subfieldSegments,
  path,
}: {
  field: ValidationRuleFieldDescriptor;
  subfieldSegments: string[];
  path: string;
}): string | null => {
  if (subfieldSegments.length === 0) {
    return null;
  }

  const compositeType = compositeTypeDefinitions.get(field.type);

  if (!isDefined(compositeType) || subfieldSegments.length > 1) {
    return `"${path}" goes deeper than the field "${field.name}" allows`;
  }

  const isKnownSubfield = compositeType.properties.some(
    (property) => property.name === subfieldSegments[0],
  );

  return isKnownSubfield
    ? null
    : `"${subfieldSegments[0]}" is not a subfield of "${field.name}"`;
};

export const resolveValidationRuleIdentifierPath = ({
  path,
  fields,
  bindings,
  acceptsFieldNames,
}: {
  path: string;
  fields: ValidationRuleFieldDescriptor[];
  bindings: ValidationRuleBindings;
  acceptsFieldNames: boolean;
}): ResolveValidationRuleIdentifierPathResult => {
  const [rootSegment, ...memberSegments] = path.split('.');

  if (!isDefined(rootSegment)) {
    return { isResolved: false, errorMessage: `"${path}" is not a value` };
  }

  if (rootSegment === VALIDATION_RULE_NOW_VARIABLE_NAME) {
    return memberSegments.length === 0
      ? { isResolved: true, resolvedPath: { type: 'now' } }
      : { isResolved: false, errorMessage: `"${path}" is not a value` };
  }

  const rootFieldResolution = resolveFieldSegment({
    segment: rootSegment,
    candidateFields: fields,
    bindings,
    acceptsFieldNames,
    unknownFieldErrorMessage: `Unknown field "${rootSegment}"`,
  });

  if (!rootFieldResolution.isResolved) {
    return rootFieldResolution;
  }

  const rootField = rootFieldResolution.field;

  const isRelationField =
    rootField.type === FieldMetadataType.RELATION ||
    rootField.type === FieldMetadataType.MORPH_RELATION;

  if (!isRelationField) {
    const subfieldError = resolveSubfieldSegments({
      field: rootField,
      subfieldSegments: memberSegments,
      path,
    });

    return !isDefined(subfieldError)
      ? {
          isResolved: true,
          resolvedPath: {
            type: 'field',
            rootField,
            targetField: null,
            subfieldName: memberSegments[0] ?? null,
          },
        }
      : { isResolved: false, errorMessage: subfieldError };
  }

  if (
    rootField.type === FieldMetadataType.MORPH_RELATION ||
    rootField.relationType !== RelationType.MANY_TO_ONE ||
    !isDefined(rootField.relationTargetFields)
  ) {
    return {
      isResolved: false,
      errorMessage: `"${rootField.name}" is not a to-one relation`,
    };
  }

  const [targetFieldSegment, ...targetSubfieldSegments] = memberSegments;

  if (!isDefined(targetFieldSegment)) {
    return {
      isResolved: true,
      resolvedPath: {
        type: 'field',
        rootField,
        targetField: null,
        subfieldName: null,
      },
    };
  }

  const targetFieldResolution = resolveFieldSegment({
    segment: targetFieldSegment,
    candidateFields: rootField.relationTargetFields,
    bindings,
    acceptsFieldNames,
    unknownFieldErrorMessage: `Unknown field "${targetFieldSegment}" on "${rootField.name}"`,
  });

  if (!targetFieldResolution.isResolved) {
    return targetFieldResolution;
  }

  const targetField = targetFieldResolution.field;

  if (
    targetField.type === FieldMetadataType.RELATION ||
    targetField.type === FieldMetadataType.MORPH_RELATION
  ) {
    return {
      isResolved: false,
      errorMessage: `"${path}" goes more than one relation deep`,
    };
  }

  const subfieldError = resolveSubfieldSegments({
    field: targetField,
    subfieldSegments: targetSubfieldSegments,
    path,
  });

  return !isDefined(subfieldError)
    ? {
        isResolved: true,
        resolvedPath: {
          type: 'field',
          rootField,
          targetField,
          subfieldName: targetSubfieldSegments[0] ?? null,
        },
      }
    : { isResolved: false, errorMessage: subfieldError };
};
