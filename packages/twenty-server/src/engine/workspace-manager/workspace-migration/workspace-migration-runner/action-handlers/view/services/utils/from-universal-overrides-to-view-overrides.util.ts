import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type ViewOverrides } from 'src/engine/metadata-modules/view/entities/view.entity';

type UniversalViewOverrides =
  FormatRecordSerializedRelationProperties<ViewOverrides>;

const VIEW_OVERRIDES_UNIVERSAL_FIELD_METADATA_PROPERTIES = [
  'kanbanAggregateOperationFieldMetadataUniversalIdentifier',
  'calendarFieldMetadataUniversalIdentifier',
  'mainGroupByFieldMetadataUniversalIdentifier',
] as const;

type ViewOverridesUniversalFieldMetadataProperty =
  (typeof VIEW_OVERRIDES_UNIVERSAL_FIELD_METADATA_PROPERTIES)[number];

const toForeignKeyProperty = (
  universalProperty: ViewOverridesUniversalFieldMetadataProperty,
) =>
  universalProperty.replace(
    /UniversalIdentifier$/,
    'Id',
  ) as keyof ViewOverrides;

export const fromUniversalOverridesToViewOverrides = ({
  universalOverrides,
  flatFieldMetadataMaps,
}: {
  universalOverrides: UniversalViewOverrides;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): ViewOverrides => {
  const {
    kanbanAggregateOperationFieldMetadataUniversalIdentifier: _kanban,
    calendarFieldMetadataUniversalIdentifier: _calendar,
    mainGroupByFieldMetadataUniversalIdentifier: _mainGroupBy,
    ...scalarOverrides
  } = universalOverrides;

  return VIEW_OVERRIDES_UNIVERSAL_FIELD_METADATA_PROPERTIES.reduce<ViewOverrides>(
    (acc, universalProperty) => {
      const universalIdentifier = universalOverrides[universalProperty];

      if (universalIdentifier === undefined) {
        return acc;
      }

      const foreignKeyProperty = toForeignKeyProperty(universalProperty);

      if (universalIdentifier === null) {
        return { ...acc, [foreignKeyProperty]: null };
      }

      const flatFieldMetadata =
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        });

      return { ...acc, [foreignKeyProperty]: flatFieldMetadata?.id ?? null };
    },
    scalarOverrides,
  );
};
