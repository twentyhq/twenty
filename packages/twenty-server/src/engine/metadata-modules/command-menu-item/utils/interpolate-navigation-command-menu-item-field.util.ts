import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES } from 'twenty-shared/translations';
import {
  interpolateCommandMenuItemTemplate,
  isDefined,
} from 'twenty-shared/utils';

import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { resolveObjectMetadataStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/resolve-object-metadata-standard-override.util';

const buildNavigationInterpolationContext = ({
  objectMetadata,
  locale,
  i18nInstance,
}: {
  objectMetadata: ObjectMetadataDTO;
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

export const interpolateNavigationCommandMenuItemField = ({
  commandMenuItem,
  fieldName,
  objectMetadata,
  locale,
  i18nInstance,
}: {
  commandMenuItem: CommandMenuItemDTO;
  fieldName: 'label' | 'shortLabel' | 'icon';
  objectMetadata: ObjectMetadataDTO | null;
  locale: keyof typeof APP_LOCALES | undefined;
  i18nInstance: I18n;
}): string | undefined => {
  const rawValue = commandMenuItem[fieldName];

  if (
    commandMenuItem.engineComponentKey !== EngineComponentKey.NAVIGATION ||
    !isObjectMetadataCommandMenuItemPayload(commandMenuItem.payload)
  ) {
    return rawValue;
  }

  if (!isDefined(objectMetadata)) {
    return undefined;
  }

  if (!isNonEmptyString(rawValue)) {
    return rawValue;
  }

  const context = buildNavigationInterpolationContext({
    objectMetadata,
    locale,
    i18nInstance,
  });

  return (
    interpolateCommandMenuItemTemplate({
      label: rawValue,
      context,
    }) ?? rawValue
  );
};
