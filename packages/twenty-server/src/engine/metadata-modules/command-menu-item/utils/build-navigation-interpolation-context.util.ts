import { type I18n } from '@lingui/core';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { type ObjectStandardOverridesDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-standard-overrides.dto';
import { resolveObjectMetadataStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/resolve-object-metadata-standard-override.util';

export type NavigationInterpolationObjectMetadata = {
  labelPlural: string;
  labelSingular: string;
  description?: string | null;
  icon?: string | null;
  isCustom: boolean;
  standardOverrides?: ObjectStandardOverridesDTO | null;
};

export const buildNavigationInterpolationContext = ({
  objectMetadata,
  locale,
  i18nInstance,
}: {
  objectMetadata: NavigationInterpolationObjectMetadata;
  locale: keyof typeof APP_LOCALES | undefined;
  i18nInstance: I18n;
}): Record<string, unknown> => {
  const overrideInput = {
    labelPlural: objectMetadata.labelPlural,
    labelSingular: objectMetadata.labelSingular,
    description: objectMetadata.description ?? undefined,
    icon: objectMetadata.icon ?? undefined,
    isCustom: objectMetadata.isCustom,
    standardOverrides: objectMetadata.standardOverrides ?? undefined,
  };

  const resolvedLabelPlural = resolveObjectMetadataStandardOverride(
    overrideInput,
    'labelPlural',
    locale,
    i18nInstance,
  );

  const resolvedIcon = resolveObjectMetadataStandardOverride(
    overrideInput,
    'icon',
    locale,
    i18nInstance,
  );

  return {
    navigateToObjectMetadataItem: {
      labelPlural: resolvedLabelPlural,
      icon: resolvedIcon,
    },
  };
};
