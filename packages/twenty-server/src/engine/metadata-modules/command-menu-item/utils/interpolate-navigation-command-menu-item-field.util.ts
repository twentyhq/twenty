import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES } from 'twenty-shared/translations';
import {
  interpolateCommandMenuItemTemplate,
  isDefined,
} from 'twenty-shared/utils';

import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { buildNavigationInterpolationContext } from 'src/engine/metadata-modules/command-menu-item/utils/build-navigation-interpolation-context.util';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

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
