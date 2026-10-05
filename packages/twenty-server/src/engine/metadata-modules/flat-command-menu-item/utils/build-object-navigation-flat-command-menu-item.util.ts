import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { buildObjectNavigationUniversalFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';

export const buildObjectNavigationFlatCommandMenuItem = ({
  objectMetadata,
  commandMenuItemId,
  applicationId,
  applicationUniversalIdentifier,
  workspaceId,
  position,
  now,
}: {
  objectMetadata: {
    id: string;
    universalIdentifier: string;
    nameSingular: string;
    shortcut: string | null;
    isActive: boolean;
  };
  commandMenuItemId: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
  workspaceId: string;
  position: number;
  now: string;
}): FlatCommandMenuItem => ({
  ...buildObjectNavigationUniversalFlatCommandMenuItem({
    objectMetadata,
    applicationUniversalIdentifier,
    position,
    now,
  }),
  id: commandMenuItemId,
  applicationId,
  workspaceId,
  frontComponentId: null,
  navigationTargetObjectMetadataId: objectMetadata.id,
  availabilityObjectMetadataId: null,
  pageLayoutId: null,
  overrides: null,
});
