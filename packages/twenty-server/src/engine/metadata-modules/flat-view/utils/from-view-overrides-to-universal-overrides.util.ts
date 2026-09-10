import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type ViewOverrides } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type MetadataUniversalEntityOverrides } from 'src/engine/metadata-modules/utils/metadata-universal-entity-overrides.type';

const VIEW_OVERRIDES_FIELD_METADATA_FOREIGN_KEYS = [
  'kanbanAggregateOperationFieldMetadataId',
  'calendarFieldMetadataId',
  'calendarEndFieldMetadataId',
  'mainGroupByFieldMetadataId',
] as const;

type ViewOverridesFieldMetadataForeignKey =
  (typeof VIEW_OVERRIDES_FIELD_METADATA_FOREIGN_KEYS)[number];

const toUniversalIdentifierProperty = (
  foreignKey: ViewOverridesFieldMetadataForeignKey,
) =>
  foreignKey.replace(
    /Id$/,
    'UniversalIdentifier',
  ) as keyof MetadataUniversalEntityOverrides<'view'>;

export const fromViewOverridesToUniversalOverrides = ({
  overrides,
  fieldMetadataUniversalIdentifierById,
  shouldThrowOnMissingIdentifier = true,
}: {
  overrides: ViewOverrides;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier?: boolean;
}): MetadataUniversalEntityOverrides<'view'> => {
  const {
    kanbanAggregateOperationFieldMetadataId: _kanban,
    calendarFieldMetadataId: _calendar,
    calendarEndFieldMetadataId: _calendarEnd,
    mainGroupByFieldMetadataId: _mainGroupBy,
    ...scalarOverrides
  } = overrides;

  return VIEW_OVERRIDES_FIELD_METADATA_FOREIGN_KEYS.reduce<
    MetadataUniversalEntityOverrides<'view'>
  >((acc, foreignKey) => {
    const foreignKeyValue = overrides[foreignKey];

    if (foreignKeyValue === undefined) {
      return acc;
    }

    const universalIdentifierProperty =
      toUniversalIdentifierProperty(foreignKey);

    if (foreignKeyValue === null) {
      return { ...acc, [universalIdentifierProperty]: null };
    }

    const universalIdentifier =
      fieldMetadataUniversalIdentifierById[foreignKeyValue];

    if (!isDefined(universalIdentifier)) {
      if (shouldThrowOnMissingIdentifier) {
        throw new FlatEntityMapsException(
          `FieldMetadata universal identifier not found for id: ${foreignKeyValue}`,
          FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
        );
      }

      return { ...acc, [universalIdentifierProperty]: null };
    }

    return { ...acc, [universalIdentifierProperty]: universalIdentifier };
  }, scalarOverrides);
};
