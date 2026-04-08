import { createUnionType } from '@nestjs/graphql';

import { ObjectMetadataNavigationPayloadDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/object-metadata-navigation-payload.dto';
import { PathNavigationPayloadDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/path-navigation-payload.dto';
import { type ObjectMetadataNavigationPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/object-metadata-navigation-payload.type';
import { type PathNavigationPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/path-navigation-payload.type';

export type CommandMenuItemPayload =
  | PathNavigationPayload
  | ObjectMetadataNavigationPayload;

export const CommandMenuItemPayloadUnion = createUnionType({
  name: 'NavigationPayload',
  types: () => [PathNavigationPayloadDTO, ObjectMetadataNavigationPayloadDTO],
  resolveType(payload: CommandMenuItemPayload) {
    if ('path' in payload) {
      return PathNavigationPayloadDTO;
    }

    return ObjectMetadataNavigationPayloadDTO;
  },
});
