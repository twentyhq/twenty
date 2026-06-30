import { createUnionType } from '@nestjs/graphql';

import { ObjectMetadataCommandMenuItemPayloadDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/object-metadata-command-menu-item-payload.dto';
import { PathCommandMenuItemPayloadDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/path-command-menu-item-payload.dto';
import { type ObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/object-metadata-command-menu-item-payload.type';
import { type PathCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/path-command-menu-item-payload.type';

export type CommandMenuItemPayload =
  | PathCommandMenuItemPayload
  | ObjectMetadataCommandMenuItemPayload;

export const CommandMenuItemPayloadUnion = createUnionType({
  name: 'CommandMenuItemPayload',
  types: () => [
    PathCommandMenuItemPayloadDTO,
    ObjectMetadataCommandMenuItemPayloadDTO,
  ],
  resolveType(payload: CommandMenuItemPayload) {
    if ('path' in payload) {
      return PathCommandMenuItemPayloadDTO;
    }

    if ('objectMetadataItemId' in payload) {
      return ObjectMetadataCommandMenuItemPayloadDTO;
    }

    return undefined;
  },
});
