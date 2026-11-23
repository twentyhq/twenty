import { msg } from '@lingui/core/macro';
import {
  type FieldMetadataRollupSettings,
  FieldMetadataType,
} from 'twenty-shared/types';
import {
  computeRollupResultType,
  getFieldMetadataValueType,
  isDefined,
} from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { rollupSettingsInputSchema } from 'src/engine/metadata-modules/flat-field-metadata/schemas/rollup-settings-input.schema';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';

export const fromRollupSettingsInputToRollupSettings = ({
  settingsInput,
  flatFieldMetadataMaps,
}: {
  settingsInput: unknown;
} & Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps'
>): FieldInputTranspilationResult<FieldMetadataRollupSettings> => {
  const parsedSettings = rollupSettingsInputSchema.safeParse(settingsInput);

  if (!parsedSettings.success) {
    return {
      status: 'fail',
      errors: [
        {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: `Invalid rollup settings: ${parsedSettings.error.message}`,
          userFriendlyMessage: msg`The rollup settings are invalid`,
        },
      ],
    };
  }

  const { aggregatedFieldMetadataId = null, ...settings } = parsedSettings.data;
  const aggregatedFlatFieldMetadata = isDefined(aggregatedFieldMetadataId)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: aggregatedFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;
  const resultType = computeRollupResultType({
    aggregateOperation: settings.aggregateOperation,
    aggregatedFieldValueType: isDefined(aggregatedFlatFieldMetadata)
      ? getFieldMetadataValueType(aggregatedFlatFieldMetadata)
      : null,
  });

  return {
    status: 'success',
    result: {
      ...settings,
      aggregatedFieldMetadataId,
      // The validator sees the aggregated field and reports an operation it cannot take
      resultType: resultType ?? FieldMetadataType.NUMBER,
    },
  };
};
