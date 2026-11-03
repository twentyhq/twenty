import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { isRoleReferencedByUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-role-referenced-by-universal-flat-entity-maps.util';

export const isRoleReferencedByConditionalDisplay = ({
  roleUniversalIdentifier,
  flatPageLayoutWidgetMaps,
  flatPageLayoutTabMaps,
  flatViewFieldMaps,
  flatCommandMenuItemMaps,
  flatNavigationMenuItemMaps,
}: {
  roleUniversalIdentifier: string;
} & Pick<
  AllUniversalFlatEntityMaps,
  | 'flatPageLayoutWidgetMaps'
  | 'flatPageLayoutTabMaps'
  | 'flatViewFieldMaps'
  | 'flatCommandMenuItemMaps'
  | 'flatNavigationMenuItemMaps'
>): boolean =>
  isRoleReferencedByUniversalFlatEntityMaps({
    roleUniversalIdentifier,
    metadataName: 'pageLayoutWidget',
    flatEntityMaps: flatPageLayoutWidgetMaps,
  }) ||
  isRoleReferencedByUniversalFlatEntityMaps({
    roleUniversalIdentifier,
    metadataName: 'pageLayoutTab',
    flatEntityMaps: flatPageLayoutTabMaps,
  }) ||
  isRoleReferencedByUniversalFlatEntityMaps({
    roleUniversalIdentifier,
    metadataName: 'viewField',
    flatEntityMaps: flatViewFieldMaps,
  }) ||
  isRoleReferencedByUniversalFlatEntityMaps({
    roleUniversalIdentifier,
    metadataName: 'commandMenuItem',
    flatEntityMaps: flatCommandMenuItemMaps,
  }) ||
  isRoleReferencedByUniversalFlatEntityMaps({
    roleUniversalIdentifier,
    metadataName: 'navigationMenuItem',
    flatEntityMaps: flatNavigationMenuItemMaps,
  });
