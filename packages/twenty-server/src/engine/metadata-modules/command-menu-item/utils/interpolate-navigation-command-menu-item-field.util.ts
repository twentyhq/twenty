import { isNonEmptyString } from '@sniptt/guards';
import {
  interpolateCommandMenuItemTemplate,
  isDefined,
} from 'twenty-shared/utils';

import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import {
  buildNavigationInterpolationContext,
  type NavigationInterpolationObjectMetadata,
} from 'src/engine/metadata-modules/command-menu-item/utils/build-navigation-interpolation-context.util';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';

// NAVIGATION items are the only ones whose template can be resolved server-side:
// they carry their target object in the payload. Every other availability type
// is rendered against whichever object page the user is on, so its placeholders
// are substituted by the client.
export const interpolateNavigationCommandMenuItemField = ({
  commandMenuItem,
  resolvedValue,
  objectMetadata,
  objectMetadataI18nContext,
}: {
  commandMenuItem: Pick<CommandMenuItemDTO, 'engineComponentKey' | 'payload'>;
  resolvedValue: string | undefined;
  objectMetadata: NavigationInterpolationObjectMetadata | null;
  objectMetadataI18nContext: EffectiveEntityI18nContext;
}): string | undefined => {
  if (
    commandMenuItem.engineComponentKey !== EngineComponentKey.NAVIGATION ||
    !isObjectMetadataCommandMenuItemPayload(commandMenuItem.payload)
  ) {
    return resolvedValue;
  }

  if (!isDefined(objectMetadata)) {
    return undefined;
  }

  if (!isNonEmptyString(resolvedValue)) {
    return resolvedValue;
  }

  const context = buildNavigationInterpolationContext({
    objectMetadata,
    i18nContext: objectMetadataI18nContext,
  });

  return (
    interpolateCommandMenuItemTemplate({
      label: resolvedValue,
      context,
    }) ?? resolvedValue
  );
};
