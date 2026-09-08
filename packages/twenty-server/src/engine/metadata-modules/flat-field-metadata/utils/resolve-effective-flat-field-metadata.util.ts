import { TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'twenty-shared/i18n';

import {
  type MetadataEntityOverridablePropertyName,
  type MetadataEntityTranslatablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-overridable-properties-by-metadata-name.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-flat-entity-property.util';

const TRANSLATABLE_FIELD_METADATA_PROPERTIES = new Set<string>(
  TRANSLATABLE_PROPERTIES_BY_METADATA_NAME.fieldMetadata,
);

const isTranslatableFieldMetadataProperty = (
  property: MetadataEntityOverridablePropertyName<'fieldMetadata'>,
): property is MetadataEntityTranslatablePropertyName<'fieldMetadata'> =>
  TRANSLATABLE_FIELD_METADATA_PROPERTIES.has(property);

// Translatable properties go through the catalog-aware resolver; the other
// overridable ones, icon and isActive among them, keep their own type and
// only resolve across author entries.
export const resolveEffectiveFlatFieldMetadata = ({
  flatFieldMetadata,
  i18nContext,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  i18nContext: EffectiveEntityI18nContext;
}): FlatFieldMetadata =>
  ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME.fieldMetadata.reduce(
    (effectiveFlatFieldMetadata, property) => ({
      ...effectiveFlatFieldMetadata,
      [property]: isTranslatableFieldMetadataProperty(property)
        ? resolveEffectiveEntityProperty({
            metadataName: 'fieldMetadata',
            baseValue: flatFieldMetadata[property],
            overrides: flatFieldMetadata.overrides,
            property,
            i18nContext,
          })
        : resolveEffectiveFlatEntityProperty(
            flatFieldMetadata,
            property,
            i18nContext,
          ),
    }),
    flatFieldMetadata,
  );
