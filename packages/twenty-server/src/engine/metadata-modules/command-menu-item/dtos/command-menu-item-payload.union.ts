import { createUnionType } from '@nestjs/graphql';

import { PathCommandMenuItemPayloadDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/path-command-menu-item-payload.dto';
import { type PathCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/path-command-menu-item-payload.type';

export type CommandMenuItemPayload = PathCommandMenuItemPayload;

// Still a union so clients selecting `... on PathCommandMenuItemPayload` keep
// resolving now that the object metadata variant is gone
export const CommandMenuItemPayloadUnion = createUnionType({
  name: 'CommandMenuItemPayload',
  types: () => [PathCommandMenuItemPayloadDTO],
  resolveType: () => PathCommandMenuItemPayloadDTO,
});
