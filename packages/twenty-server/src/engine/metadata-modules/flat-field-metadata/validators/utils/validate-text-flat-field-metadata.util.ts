import { msg } from '@lingui/core/macro';
import { LABEL_IDENTIFIER_FORMULA_FIELD_METADATA_TYPES } from 'twenty-shared/constants';
import {
  FieldMetadataSettingsMapping,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';

const MAX_LABEL_IDENTIFIER_FORMULA_LENGTH = 255;
const MAX_LABEL_IDENTIFIER_FORMULA_FIELD_REFERENCES = 20;
const FORMULA_SLOT_REGEX = /\{(\d+)\}/g;

const SUPPORTED_LABEL_IDENTIFIER_FORMULA_FIELD_TYPES =
  new Set<FieldMetadataType>(LABEL_IDENTIFIER_FORMULA_FIELD_METADATA_TYPES);

const invalidFormulaError = (
  message: string,
): FlatFieldMetadataValidationError => ({
  code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
  message,
  userFriendlyMessage: msg`The record label formula is invalid.`,
});

export const validateTextFlatFieldMetadata = (
  args: FlatFieldMetadataTypeValidationArgs<FieldMetadataType.TEXT>,
): FlatFieldMetadataValidationError[] => {
  const {
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
  } = args;

  const settings = flatEntityToValidate.universalSettings as
    | FieldMetadataSettingsMapping[FieldMetadataType.TEXT]
    | null;
  const formula = settings?.labelIdentifierFormula;

  if (!isDefined(formula)) {
    return [];
  }

  const parentObjectMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatEntityToValidate.objectMetadataUniversalIdentifier,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(parentObjectMetadata)) {
    return [invalidFormulaError('Formula parent object metadata not found')];
  }

  if (
    parentObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier !==
    flatEntityToValidate.universalIdentifier
  ) {
    return [
      invalidFormulaError(
        'Only the label identifier field can define a record label formula',
      ),
    ];
  }

  if (
    formula.template.length === 0 ||
    formula.template.length > MAX_LABEL_IDENTIFIER_FORMULA_LENGTH
  ) {
    return [
      invalidFormulaError(
        `Formula template must contain between 1 and ${MAX_LABEL_IDENTIFIER_FORMULA_LENGTH} characters`,
      ),
    ];
  }

  if (
    formula.fieldReferences.length === 0 ||
    formula.fieldReferences.length >
      MAX_LABEL_IDENTIFIER_FORMULA_FIELD_REFERENCES
  ) {
    return [
      invalidFormulaError(
        `Formula must reference between 1 and ${MAX_LABEL_IDENTIFIER_FORMULA_FIELD_REFERENCES} fields`,
      ),
    ];
  }

  const referencedSlotIndexes = new Set<number>();

  for (const match of formula.template.matchAll(FORMULA_SLOT_REGEX)) {
    referencedSlotIndexes.add(Number(match[1]));
  }

  const templateWithoutValidSlots = formula.template.replace(
    FORMULA_SLOT_REGEX,
    '',
  );

  if (
    templateWithoutValidSlots.includes('{') ||
    templateWithoutValidSlots.includes('}')
  ) {
    return [invalidFormulaError('Formula template contains an invalid slot')];
  }

  if (
    formula.fieldReferences.some(
      (_, index) => !referencedSlotIndexes.has(index),
    ) ||
    [...referencedSlotIndexes].some(
      (index) => index >= formula.fieldReferences.length,
    )
  ) {
    return [
      invalidFormulaError(
        'Formula template slots do not match its field references',
      ),
    ];
  }

  for (const fieldReference of formula.fieldReferences) {
    if (fieldReference.fieldMetadataUniversalIdentifiers.length === 0) {
      return [invalidFormulaError('Formula field fallback cannot be empty')];
    }

    for (const fieldUniversalIdentifier of fieldReference.fieldMetadataUniversalIdentifiers) {
      const referencedFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier: fieldUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(referencedFieldMetadata)) {
        return [
          invalidFormulaError(
            `Formula field ${fieldUniversalIdentifier} was not found`,
          ),
        ];
      }

      if (
        referencedFieldMetadata.objectMetadataUniversalIdentifier !==
        parentObjectMetadata.universalIdentifier
      ) {
        return [
          invalidFormulaError('Formula fields must belong to the same object'),
        ];
      }

      if (
        referencedFieldMetadata.universalIdentifier ===
        flatEntityToValidate.universalIdentifier
      ) {
        return [
          invalidFormulaError('A record label formula cannot reference itself'),
        ];
      }

      if (
        !SUPPORTED_LABEL_IDENTIFIER_FORMULA_FIELD_TYPES.has(
          referencedFieldMetadata.type,
        )
      ) {
        return [
          invalidFormulaError(
            `Field ${referencedFieldMetadata.name} has an unsupported formula type`,
          ),
        ];
      }

      if (referencedFieldMetadata.type === FieldMetadataType.RELATION) {
        const relationSettings = referencedFieldMetadata.universalSettings as
          | FieldMetadataSettingsMapping[FieldMetadataType.RELATION]
          | null;

        if (relationSettings?.relationType !== RelationType.MANY_TO_ONE) {
          return [
            invalidFormulaError(
              `Relation field ${referencedFieldMetadata.name} must be many-to-one`,
            ),
          ];
        }

        if (
          referencedFieldMetadata.relationTargetObjectMetadataUniversalIdentifier ===
          parentObjectMetadata.universalIdentifier
        ) {
          return [
            invalidFormulaError(
              'A record label formula cannot reference its own object through a relation',
            ),
          ];
        }
      }
    }
  }

  return [];
};
