import { isDefined } from 'twenty-shared/utils';

import { type ObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/object-metadata-command-menu-item-payload.type';

export const isObjectMetadataCommandMenuItemPayload = (
  payload?: unknown,
): payload is ObjectMetadataCommandMenuItemPayload =>
  isDefined(payload) &&
  typeof payload === 'object' &&
  'objectMetadataItemId' in payload;
