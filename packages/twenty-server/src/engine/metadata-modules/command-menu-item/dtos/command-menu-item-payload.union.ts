import { createUnionType } from '@nestjs/graphql';

import { PathCommandMenuItemPayloadDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/path-command-menu-item-payload.dto';
import { type ObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/object-metadata-command-menu-item-payload.type';
import { type PathCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/path-command-menu-item-payload.type';

// The legacy { objectMetadataItemId } variant stays in the column type because
// pre-2-38 upgrade commands replayed during sequential upgrades still write it;
// the 2-38 payload rewrite converges every row onto { path } plus
// navigationTargetObjectMetadataId, and nothing outside upgrade commands may
// read the legacy shape.
export type CommandMenuItemPayload =
  | PathCommandMenuItemPayload
  | ObjectMetadataCommandMenuItemPayload;

export const CommandMenuItemPayloadUnion = createUnionType({
  name: 'CommandMenuItemPayload',
  types: () => [PathCommandMenuItemPayloadDTO],
  // A legacy payload not yet rewritten by the 2-38 command degrades to
  // { path: null }: its target is already served by
  // navigationTargetObjectMetadataId since the 2-35 backfill.
  resolveType() {
    return PathCommandMenuItemPayloadDTO;
  },
});
