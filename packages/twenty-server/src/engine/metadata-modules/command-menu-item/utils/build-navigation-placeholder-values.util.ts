import {
  buildObjectMetadataLabelPlaceholderValues,
  type MetadataLabelPlaceholderValues,
} from 'twenty-shared/i18n';

import { type ObjectMetadataOverrides } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-overrides.type';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

export type NavigationPlaceholderObjectMetadata = {
  labelPlural: string;
  icon?: string | null;
  overrides?: ObjectMetadataOverrides | null;
};

export const buildNavigationPlaceholderValues = ({
  objectMetadata,
  i18nContext,
}: {
  objectMetadata: NavigationPlaceholderObjectMetadata;
  i18nContext: EffectiveEntityI18nContext;
}): MetadataLabelPlaceholderValues => {
  const overrides = objectMetadata.overrides ?? undefined;

  const resolvedLabelPlural = resolveEffectiveEntityProperty({
    metadataName: 'objectMetadata',
    baseValue: objectMetadata.labelPlural,
    overrides,
    property: 'labelPlural',
    i18nContext,
  });

  const resolvedIcon = resolveEffectiveEntityProperty({
    metadataName: 'objectMetadata',
    baseValue: objectMetadata.icon,
    overrides,
    property: 'icon',
    i18nContext,
  });

  return buildObjectMetadataLabelPlaceholderValues({
    labelPlural: resolvedLabelPlural,
    icon: resolvedIcon,
  });
};
