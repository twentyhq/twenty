import { isNonEmptyString } from '@sniptt/guards';
import { interpolateMessagePlaceholders } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import {
  buildNavigationPlaceholderValues,
  type NavigationPlaceholderObjectMetadata,
} from 'src/engine/metadata-modules/command-menu-item/utils/build-navigation-placeholder-values.util';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';

// NAVIGATION items are the only ones whose placeholders the server can fill:
// they carry their target object as a foreign key. Every other availability
// type is rendered against whichever object page the user is on, so its
// placeholders travel untouched and are filled by the client.
export const interpolateNavigationCommandMenuItemField = ({
  commandMenuItem,
  resolvedValue,
  objectMetadata,
  objectMetadataI18nContext,
}: {
  commandMenuItem: Pick<
    CommandMenuItemDTO,
    'engineComponentKey' | 'navigationTargetObjectMetadataId'
  >;
  resolvedValue: string | undefined;
  objectMetadata: NavigationPlaceholderObjectMetadata | null;
  objectMetadataI18nContext: EffectiveEntityI18nContext;
}): string | undefined => {
  if (
    commandMenuItem.engineComponentKey !== EngineComponentKey.NAVIGATION ||
    !isDefined(commandMenuItem.navigationTargetObjectMetadataId)
  ) {
    return resolvedValue;
  }

  if (!isDefined(objectMetadata)) {
    return undefined;
  }

  if (!isNonEmptyString(resolvedValue)) {
    return resolvedValue;
  }

  return interpolateMessagePlaceholders(
    resolvedValue,
    buildNavigationPlaceholderValues({
      objectMetadata,
      i18nContext: objectMetadataI18nContext,
    }),
  );
};
