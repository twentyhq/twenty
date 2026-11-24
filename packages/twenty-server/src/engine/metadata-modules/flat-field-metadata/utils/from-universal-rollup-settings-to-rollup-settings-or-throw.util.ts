import { type FieldMetadataRollupSettings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type UniversalRollupSettings } from 'src/engine/metadata-modules/flat-field-metadata/types/universal-rollup-settings.type';

export const fromUniversalRollupSettingsToRollupSettingsOrThrow = ({
  universalSettings: {
    relationFieldMetadataUniversalIdentifier,
    aggregatedFieldMetadataUniversalIdentifier,
    filters,
    ...universalSettings
  },
  findFieldMetadataIdByUniversalIdentifier,
}: {
  universalSettings: UniversalRollupSettings;
  findFieldMetadataIdByUniversalIdentifier: (
    universalIdentifier: string,
  ) => string | null;
}): FieldMetadataRollupSettings => {
  const toFieldMetadataIdOrThrow = (universalIdentifier: string | null) => {
    const fieldMetadataId = isDefined(universalIdentifier)
      ? findFieldMetadataIdByUniversalIdentifier(universalIdentifier)
      : null;

    if (!isDefined(fieldMetadataId)) {
      throw new FlatEntityMapsException(
        `Could not find the field a rollup refers to: ${universalIdentifier}`,
        FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
      );
    }

    return fieldMetadataId;
  };

  return {
    ...universalSettings,
    relationFieldMetadataId: toFieldMetadataIdOrThrow(
      relationFieldMetadataUniversalIdentifier,
    ),
    aggregatedFieldMetadataId: isDefined(
      aggregatedFieldMetadataUniversalIdentifier,
    )
      ? toFieldMetadataIdOrThrow(aggregatedFieldMetadataUniversalIdentifier)
      : null,
    filters: filters.map(({ fieldMetadataUniversalIdentifier, ...filter }) => ({
      ...filter,
      fieldMetadataId: toFieldMetadataIdOrThrow(
        fieldMetadataUniversalIdentifier,
      ),
    })),
  };
};
