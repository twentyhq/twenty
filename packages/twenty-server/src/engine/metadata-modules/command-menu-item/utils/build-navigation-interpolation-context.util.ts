import { type I18n } from '@lingui/core';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { type ObjectMetadataOverrides } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-overrides.type';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

export type NavigationInterpolationObjectMetadata = {
  labelPlural: string;
  labelSingular: string;
  description?: string | null;
  icon?: string | null;
  overrides?: ObjectMetadataOverrides | null;
};

export const buildNavigationInterpolationContext = ({
  objectMetadata,
  isStandardApp,
  locale,
  i18nInstance,
  applicationCatalog,
}: {
  objectMetadata: NavigationInterpolationObjectMetadata;
  isStandardApp: boolean;
  locale: keyof typeof APP_LOCALES | undefined;
  i18nInstance: I18n;
  applicationCatalog?: Record<string, string>;
}): Record<string, unknown> => {
  const overrides = objectMetadata.overrides ?? undefined;
  const i18nContext = {
    locale,
    i18nInstance,
    isStandardApp,
    applicationCatalog,
  };

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

  return {
    navigateToObjectMetadataItem: {
      labelPlural: resolvedLabelPlural,
      icon: resolvedIcon,
    },
  };
};
