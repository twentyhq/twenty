import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

const isWorkspaceLevelObjectNavigationMenuItem = (
  flatNavigationMenuItem: Pick<
    UniversalFlatNavigationMenuItem,
    'type' | 'userWorkspaceId' | 'targetObjectMetadataUniversalIdentifier'
  >,
): boolean =>
  flatNavigationMenuItem.type === NavigationMenuItemType.OBJECT &&
  !isDefined(flatNavigationMenuItem.userWorkspaceId) &&
  isDefined(flatNavigationMenuItem.targetObjectMetadataUniversalIdentifier);

// Objects created in the same batch share one map snapshot, so every handler
// invocation must land on the same answer whatever the order it runs in: the
// provisioned set is derived from the trigger objects and from the rows that do
// not move during the expansion (synced items and caller-authored pending
// items), never from the engine emissions accumulating in the matrix.
export const computeObjectNavigationMenuItemPositionByObjectUniversalIdentifier =
  ({
    allFlatEntityOperationRecordByMetadataName,
    flatNavigationMenuItemMaps,
  }: {
    allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
    flatNavigationMenuItemMaps: AllFlatEntityMaps['flatNavigationMenuItemMaps'];
  }): Map<string, number> => {
    const syncedWorkspaceLevelFlatNavigationMenuItems = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatNavigationMenuItem) =>
          !isDefined(flatNavigationMenuItem.userWorkspaceId),
      );

    const basePosition =
      syncedWorkspaceLevelFlatNavigationMenuItems.length > 0
        ? Math.max(
            ...syncedWorkspaceLevelFlatNavigationMenuItems.map(
              (flatNavigationMenuItem) => flatNavigationMenuItem.position,
            ),
          ) + 1
        : 0;

    const callerPendingFlatNavigationMenuItems = Object.values(
      allFlatEntityOperationRecordByMetadataName.navigationMenuItem
        ?.flatEntityToCreate ?? {},
    )
      .filter(isDefined)
      .filter(
        (flatNavigationMenuItem) => !flatNavigationMenuItem.isSystemSideEffect,
      );

    const alreadyTargetedObjectUniversalIdentifiers = new Set(
      [
        ...syncedWorkspaceLevelFlatNavigationMenuItems,
        ...callerPendingFlatNavigationMenuItems,
      ]
        .filter(isWorkspaceLevelObjectNavigationMenuItem)
        .map(
          (flatNavigationMenuItem) =>
            flatNavigationMenuItem.targetObjectMetadataUniversalIdentifier,
        ),
    );

    const flatObjectMetadatasToProvision = (
      Object.values(
        allFlatEntityOperationRecordByMetadataName.objectMetadata
          ?.flatEntityToCreate ?? {},
      ) as UniversalFlatObjectMetadata[]
    ).filter(
      (flatObjectMetadata) =>
        !alreadyTargetedObjectUniversalIdentifiers.has(
          flatObjectMetadata.universalIdentifier,
        ),
    );

    return new Map(
      flatObjectMetadatasToProvision.map((flatObjectMetadata, index) => [
        flatObjectMetadata.universalIdentifier,
        basePosition + index,
      ]),
    );
  };
