import { isDefined } from 'twenty-shared/utils';

import { type ObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/object-metadata-command-menu-item-payload.type';

// Accepts unknown so callers holding an event payload do not have to assert a
// type in order to ask what it is.
export const isObjectMetadataCommandMenuItemPayload = (
  payload?: unknown,
): payload is ObjectMetadataCommandMenuItemPayload =>
  isDefined(payload) &&
  typeof payload === 'object' &&
  'objectMetadataItemId' in payload;
