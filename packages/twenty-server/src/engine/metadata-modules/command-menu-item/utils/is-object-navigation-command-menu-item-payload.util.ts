import { isNonEmptyString } from '@sniptt/guards';

import { type ObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/object-metadata-command-menu-item-payload.type';

// Path-first, like the payload union resolveType: a NAVIGATION payload
// carrying a path is a path command whatever else it holds, so an incidental
// or empty objectMetadataItemId never makes it an object navigation command.
export const isObjectNavigationCommandMenuItemPayload = (
  payload?: unknown,
): payload is ObjectMetadataCommandMenuItemPayload => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  if ('path' in payload && isNonEmptyString(payload.path)) {
    return false;
  }

  return (
    'objectMetadataItemId' in payload &&
    isNonEmptyString(payload.objectMetadataItemId)
  );
};
