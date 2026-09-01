import { type ObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/object-metadata-command-menu-item-payload.type';
import { type PathCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/path-command-menu-item-payload.type';

// The legacy { objectMetadataItemId } variant stays in the column type because
// pre-2-38 upgrade commands replayed during sequential upgrades still write it;
// the 2-38 slow migration erases it in favour of
// navigationTargetObjectMetadataId, and nothing outside upgrade commands may
// read the legacy shape. The schema only ever exposes the path variant.
export type CommandMenuItemPayload =
  | PathCommandMenuItemPayload
  | ObjectMetadataCommandMenuItemPayload;
