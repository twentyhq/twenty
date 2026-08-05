import { getNavigationCommandUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';

type NavigationCommandMenuItemCandidate = {
  universalIdentifier: string;
  engineComponentKey: string | null;
  payload: unknown;
};

// Matches "a navigation command already targets the object, whatever its
// identifier": either the payload points at the object's workspace id, or the
// row already holds the derived (application, object) identifier. Path-based
// NAVIGATION commands (payload: { path }) never match.
export const isNavigationCommandMenuItemForObject = ({
  commandMenuItem,
  objectMetadataId,
  derivedUniversalIdentifier,
}: {
  commandMenuItem: NavigationCommandMenuItemCandidate;
  objectMetadataId: string | undefined;
  derivedUniversalIdentifier: string;
}): boolean => {
  if (commandMenuItem.universalIdentifier === derivedUniversalIdentifier) {
    return true;
  }

  if (commandMenuItem.engineComponentKey !== EngineComponentKey.NAVIGATION) {
    return false;
  }

  const payload = commandMenuItem.payload as Parameters<
    typeof isObjectMetadataCommandMenuItemPayload
  >[0];

  return (
    isObjectMetadataCommandMenuItemPayload(payload) &&
    isDefined(objectMetadataId) &&
    payload.objectMetadataItemId === objectMetadataId
  );
};

export const findObjectNavigationFlatCommandMenuItem = <
  T extends NavigationCommandMenuItemCandidate,
>({
  commandMenuItems,
  objectMetadataId,
  objectUniversalIdentifier,
  applicationUniversalIdentifier,
}: {
  commandMenuItems: (T | undefined)[];
  objectMetadataId: string | undefined;
  objectUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
}): T | undefined => {
  const derivedUniversalIdentifier = getNavigationCommandUniversalIdentifier({
    applicationUniversalIdentifier,
    objectUniversalIdentifier,
  });

  return commandMenuItems.filter(isDefined).find((commandMenuItem) =>
    isNavigationCommandMenuItemForObject({
      commandMenuItem,
      objectMetadataId,
      derivedUniversalIdentifier,
    }),
  );
};
