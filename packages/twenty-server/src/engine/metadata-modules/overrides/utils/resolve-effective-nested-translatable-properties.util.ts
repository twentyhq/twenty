import { NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'twenty-shared/i18n';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { resolveEffectiveFieldMetadataRecordOptions } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-field-metadata-record-options.util';

type NestedTranslatableMetadataName =
  keyof typeof NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME;

const NESTED_TRANSLATABLE_PROPERTIES_RESOLVER_BY_METADATA_NAME: Record<
  NestedTranslatableMetadataName,
  (args: {
    record: Record<string, unknown>;
    i18nContext: EffectiveEntityI18nContext;
  }) => Record<string, unknown>
> = {
  fieldMetadata: resolveEffectiveFieldMetadataRecordOptions,
};

const isNestedTranslatableMetadataName = (
  metadataName: string,
): metadataName is NestedTranslatableMetadataName =>
  Object.prototype.hasOwnProperty.call(
    NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME,
    metadataName,
  );

export const resolveEffectiveNestedTranslatableProperties = ({
  metadataName,
  record,
  i18nContext,
}: {
  metadataName: string;
  record: Record<string, unknown>;
  i18nContext: EffectiveEntityI18nContext;
}): Record<string, unknown> =>
  isNestedTranslatableMetadataName(metadataName)
    ? NESTED_TRANSLATABLE_PROPERTIES_RESOLVER_BY_METADATA_NAME[metadataName]({
        record,
        i18nContext,
      })
    : {};
