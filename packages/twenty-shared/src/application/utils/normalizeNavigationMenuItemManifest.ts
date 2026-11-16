import { type NavigationMenuItemManifest } from '@/application/navigationMenuItemManifestType';
import { isDefined } from '@/utils/validation/isDefined';

// TODO(@thomtrp): remove with folderUniversalIdentifier once published apps no longer send it
export const normalizeNavigationMenuItemManifest = <
  TNavigationMenuItemManifest extends Pick<
    NavigationMenuItemManifest,
    | 'universalIdentifier'
    | 'parentUniversalIdentifier'
    | 'folderUniversalIdentifier'
  >,
>(
  navigationMenuItemManifest: TNavigationMenuItemManifest,
): Omit<TNavigationMenuItemManifest, 'folderUniversalIdentifier'> => {
  const { folderUniversalIdentifier, ...manifestWithoutFolder } =
    navigationMenuItemManifest;

  const parentUniversalIdentifier =
    navigationMenuItemManifest.parentUniversalIdentifier ??
    folderUniversalIdentifier;

  return isDefined(parentUniversalIdentifier)
    ? { ...manifestWithoutFolder, parentUniversalIdentifier }
    : manifestWithoutFolder;
};
