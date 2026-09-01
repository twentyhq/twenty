import { createUnionType } from '@nestjs/graphql';

import { ObjectMetadataCommandMenuItemPayloadDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/object-metadata-command-menu-item-payload.dto';
import { PathCommandMenuItemPayloadDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/path-command-menu-item-payload.dto';

// The object variant is never returned (fromFlatCommandMenuItemToCommandMenuItemDto
// serves legacy payloads as null) but must stay in the schema one release: the
// server deploys before the frontend, and the previous bundle still selects it.
export const CommandMenuItemPayloadUnion = createUnionType({
  name: 'CommandMenuItemPayload',
  types: () => [
    PathCommandMenuItemPayloadDTO,
    ObjectMetadataCommandMenuItemPayloadDTO,
  ],
  resolveType() {
    return PathCommandMenuItemPayloadDTO;
  },
});
