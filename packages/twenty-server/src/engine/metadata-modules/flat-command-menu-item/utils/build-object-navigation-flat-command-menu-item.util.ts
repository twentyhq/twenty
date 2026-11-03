import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { buildNavigationConditionalAvailability } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-conditional-availability.util';
import { buildObjectNavigationUniversalFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import { type FlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';

export const buildObjectNavigationFlatCommandMenuItem = ({
  objectMetadata,
  commandMenuItemId,
  applicationId,
  applicationUniversalIdentifier,
  workspaceId,
  position,
  now,
  dependencyFlatEntityMaps,
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
  dependencyFlatEntityMaps: {
    flatFieldMetadataMaps: FlatFieldMetadataMaps;
    flatRoleMaps: FlatRoleMaps;
  };
}): FlatCommandMenuItem => ({
  ...buildObjectNavigationUniversalFlatCommandMenuItem({
    objectMetadata,
    applicationUniversalIdentifier,
    position,
    now,
    dependencyFlatEntityMaps,
  }),
  id: commandMenuItemId,
  applicationId,
  workspaceId,
  frontComponentId: null,
  navigationTargetObjectMetadataId: objectMetadata.id,
  availabilityObjectMetadataId: null,
  pageLayoutId: null,
  conditionalDisplay: null,
  conditionalAvailability: buildNavigationConditionalAvailability({
    universalIdentifier: objectMetadata.universalIdentifier,
    nameSingular: objectMetadata.nameSingular,
  }),
  conditionalPinned: null,
  overrides: null,
});
