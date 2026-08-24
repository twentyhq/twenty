import { getNavigationCommandUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { buildNavigationUniversalFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { findObjectNavigationFlatCommandMenuItem } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/find-object-navigation-flat-command-menu-item.util';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';

type ObjectMetadataToProvision = {
  id: string;
  universalIdentifier: string;
  nameSingular: string;
  shortcut: string | null;
  commandMenuItemUniversalIdentifiers: string[];
};

// Shared by the create handler and the provision-on-enable path of the update
// handler: both mint the same command, and the position contract (synced
// maximum plus the index of the object in the operation batch, so a batch
// never double-books a position) has to hold identically on both. Returns
// undefined only when the engine already owns a command for the object.
export const buildObjectNavigationFlatCommandMenuItemToCreate = ({
  objectMetadata,
  applicationUniversalIdentifier,
  pendingFlatCommandMenuItemsToCreate,
  syncedFlatCommandMenuItemMaps,
  batchObjectUniversalIdentifiers,
}: {
  objectMetadata: ObjectMetadataToProvision;
  applicationUniversalIdentifier: string;
  pendingFlatCommandMenuItemsToCreate: Partial<
    Record<
      string,
      Pick<MetadataUniversalFlatEntity<'commandMenuItem'>, 'isSystemSideEffect'>
    >
  >;
  syncedFlatCommandMenuItemMaps: BuildSideEffectsArgs<'objectMetadata'>['relatedFlatEntityMaps']['flatCommandMenuItemMaps'];
  batchObjectUniversalIdentifiers: string[];
}): UniversalFlatCommandMenuItem | undefined => {
  const universalIdentifier = getNavigationCommandUniversalIdentifier({
    applicationUniversalIdentifier,
    objectUniversalIdentifier: objectMetadata.universalIdentifier,
  });

  // Only an engine-owned command stands in for the one this handler would
  // mint. A caller row targeting the object must not silence the emission:
  // the engine is the authority for isSystemSideEffect entities, so it emits
  // and the collision detector turns the squat into
  // RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER instead of the engine standing down.
  const pendingNavigationFlatCommandMenuItem =
    pendingFlatCommandMenuItemsToCreate[universalIdentifier];

  if (pendingNavigationFlatCommandMenuItem?.isSystemSideEffect === true) {
    return undefined;
  }

  const syncedNavigationFlatCommandMenuItem =
    findObjectNavigationFlatCommandMenuItem({
      commandMenuItemUniversalIdentifiers:
        objectMetadata.commandMenuItemUniversalIdentifiers,
      flatCommandMenuItemMaps: syncedFlatCommandMenuItemMaps,
      engineOwnedOnly: true,
    });

  if (isDefined(syncedNavigationFlatCommandMenuItem)) {
    return undefined;
  }

  // The command menu is one flat ordered list, so the next free position is a
  // workspace-wide maximum: no aggregator narrows it.
  const syncedMaxPosition = Object.values(
    syncedFlatCommandMenuItemMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .reduce(
      (maxPosition, flatCommandMenuItem) =>
        Math.max(maxPosition, flatCommandMenuItem.position),
      -1,
    );

  const indexInBatch = Math.max(
    batchObjectUniversalIdentifiers.indexOf(objectMetadata.universalIdentifier),
    0,
  );

  return buildNavigationUniversalFlatCommandMenuItem({
    objectMetadata,
    applicationUniversalIdentifier,
    position: syncedMaxPosition + 1 + indexInBatch,
    now: new Date().toISOString(),
  });
};
