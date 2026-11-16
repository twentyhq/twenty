import { type NavigationMenuItemManifest } from '@/application/navigationMenuItemManifestType';

export const getNavigationMenuItemManifestParentUniversalIdentifier = (
  navigationMenuItemManifest: Pick<
    NavigationMenuItemManifest,
    'parentUniversalIdentifier' | 'folderUniversalIdentifier'
  >,
): string | undefined =>
  navigationMenuItemManifest.parentUniversalIdentifier ??
  navigationMenuItemManifest.folderUniversalIdentifier;
