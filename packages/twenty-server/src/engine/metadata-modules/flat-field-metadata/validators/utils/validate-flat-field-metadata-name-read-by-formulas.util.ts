import { msg } from '@lingui/core/macro';
import {
  getFieldMetadataFormulaBindings,
  isDefined,
  isValidationRuleReservedName,
} from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// A formula's expression names the fields it reads, so they cannot take a name the expression syntax reserves
export const validateFlatFieldMetadataNameReadByFormulas = ({
  universalIdentifier,
  name,
  universalFlatFieldMetadataMaps,
}: {
  universalIdentifier: string;
  name: string;
  universalFlatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, Pick<UniversalFlatFieldMetadata, 'universalSettings'>>
    >;
  };
}): FlatFieldMetadataValidationError[] => {
  const isReservedWhereAFormulaReadsIt = Object.values(
    universalFlatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .some(({ universalSettings }) =>
      Object.entries(
        getFieldMetadataFormulaBindings({ settings: universalSettings }) ?? {},
      ).some(
        ([path, boundUniversalIdentifier]) =>
          boundUniversalIdentifier === universalIdentifier &&
          isValidationRuleReservedName({ name, isMember: path.includes('.') }),
      ),
    );

  return isReservedWhereAFormulaReadsIt
    ? [
        {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: `"${name}" is reserved in formulas, and a formula reads this field`,
          userFriendlyMessage: msg`A formula reads this field, so it cannot be named "${name}"`,
          value: name,
        },
      ]
    : [];
};
