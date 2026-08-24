import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

// The object's command menu item aggregator only holds rows whose
// navigationTargetObjectMetadataId points at it, and the engine key coherence
// constraint pins that column to null on every non-NAVIGATION row, so an entry
// here is by construction the object's navigation command. Path-based
// NAVIGATION commands carry no target and never appear.
export const findObjectNavigationFlatCommandMenuItem = ({
  commandMenuItemUniversalIdentifiers,
  flatCommandMenuItemMaps,
  engineOwnedOnly = false,
}: {
  commandMenuItemUniversalIdentifiers: string[];
  flatCommandMenuItemMaps: BuildSideEffectsArgs<'objectMetadata'>['relatedFlatEntityMaps']['flatCommandMenuItemMaps'];
  engineOwnedOnly?: boolean;
}): MetadataUniversalFlatEntity<'commandMenuItem'> | undefined => {
  for (const commandMenuItemUniversalIdentifier of commandMenuItemUniversalIdentifiers) {
    const flatCommandMenuItem =
      flatCommandMenuItemMaps.byUniversalIdentifier[
        commandMenuItemUniversalIdentifier
      ];

    if (!isDefined(flatCommandMenuItem)) {
      continue;
    }

    if (engineOwnedOnly && flatCommandMenuItem.isSystemSideEffect !== true) {
      continue;
    }

    return flatCommandMenuItem;
  }

  return undefined;
};
