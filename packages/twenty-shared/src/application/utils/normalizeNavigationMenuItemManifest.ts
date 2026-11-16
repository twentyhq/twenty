import { type NavigationMenuItemManifest } from '@/application/navigationMenuItemManifestType';
import { isDefined } from '@/utils/validation/isDefined';

// TODO: remove with folderUniversalIdentifier once published apps no longer send it
export const normalizeNavigationMenuItemManifest = (
  navigationMenuItemManifest: NavigationMenuItemManifest,
): NavigationMenuItemManifest => {
  const { folderUniversalIdentifier, ...manifestWithoutFolder } =
    navigationMenuItemManifest;

  const parentUniversalIdentifier =
    manifestWithoutFolder.parentUniversalIdentifier ??
    folderUniversalIdentifier;

  return isDefined(parentUniversalIdentifier)
    ? { ...manifestWithoutFolder, parentUniversalIdentifier }
    : manifestWithoutFolder;
};
