import { isDefined } from 'twenty-shared/utils';

import { type LegacyObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/legacy-object-metadata-command-menu-item-payload.type';

export const isLegacyObjectMetadataCommandMenuItemPayload = (
  payload?: unknown,
): payload is LegacyObjectMetadataCommandMenuItemPayload =>
  isDefined(payload) &&
  typeof payload === 'object' &&
  'objectMetadataItemId' in payload;
