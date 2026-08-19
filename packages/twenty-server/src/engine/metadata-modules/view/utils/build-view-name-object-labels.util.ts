import {
  buildObjectMetadataLabelPlaceholderValues,
  getMetadataLabelPlaceholder,
  type MetadataLabelPlaceholderValues,
} from 'twenty-shared/i18n';

import { type ObjectMetadataOverrides } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-overrides.type';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

type ViewNameObjectMetadata = {
  labelSingular: string;
  labelPlural: string;
  overrides?: ObjectMetadataOverrides | null;
};

// Each placeholder resolved costs a catalog lookup, so only the ones the name
// actually carries are resolved.
export const buildViewNameObjectLabels = ({
  viewName,
  objectMetadata,
  i18nContext,
}: {
  viewName: string;
  objectMetadata: ViewNameObjectMetadata;
  i18nContext: EffectiveEntityI18nContext;
}): MetadataLabelPlaceholderValues => {
  const resolveLabel = (property: 'labelSingular' | 'labelPlural'): string =>
    resolveEffectiveEntityProperty({
      metadataName: 'objectMetadata',
      baseValue: objectMetadata[property],
      overrides: objectMetadata.overrides ?? undefined,
      property,
      i18nContext,
    });

  return buildObjectMetadataLabelPlaceholderValues({
    labelSingular: viewName.includes(
      getMetadataLabelPlaceholder('objectLabelSingular'),
    )
      ? resolveLabel('labelSingular')
      : undefined,
    labelPlural: viewName.includes(
      getMetadataLabelPlaceholder('objectLabelPlural'),
    )
      ? resolveLabel('labelPlural')
      : undefined,
  });
};
