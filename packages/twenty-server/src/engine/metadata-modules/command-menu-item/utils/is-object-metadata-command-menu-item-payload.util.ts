import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item-payload.union';
import { type ObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/object-metadata-command-menu-item-payload.type';

export const isObjectMetadataCommandMenuItemPayload = (
  payload?: CommandMenuItemPayload | null,
): payload is ObjectMetadataCommandMenuItemPayload =>
  isDefined(payload) && 'objectMetadataItemId' in payload;
