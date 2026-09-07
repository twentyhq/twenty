import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { buildObjectNavigationUniversalFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

@Injectable()
export class ObjectNavigationCommandOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectNavigationCommandOnCreate',
    description:
      'When an object is created, provision its singleton "Go to" navigation command menu item (engineComponentKey NAVIGATION, a null payload and the target in navigationTargetObjectMetadataId), isSystemSideEffect so the engine owns its lifecycle, and isActive mirrors the object so an object created inactive gets a disabled command rather than none. Label, shortLabel and icon are interpolation templates resolved from the object at render time, the availability expression gates on the object read permission plus a feature flag for gated standard objects, and hotKeys derive from the object shortcut. The identifier is name-free and keyed on (application, object), so an object rename keeps the same command. Position is derived from the synced maximum plus the object index in the creation batch, so batch object creation never double-books a position. Noops when the object create carries no workspace id (the manifest sync path mints entity ids after side-effect expansion). twenty-standard is not concerned: it synchronizes through the from/to migration path, which never runs the side-effect engine, and seeds one navigation command per active object itself.',
  },
) {
  buildSideEffects({
    flatEntity,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const sourceFlatObjectMetadata = flatEntity as UniversalFlatObjectMetadata &
      Partial<{ id: string }>;

    if (!isDefined(sourceFlatObjectMetadata.id)) {
      return { status: 'noop' };
    }

    const syncedMaxPosition = Object.values(
      relatedFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .reduce(
        (maxPosition, flatCommandMenuItem) =>
          Math.max(maxPosition, flatCommandMenuItem.position),
        -1,
      );

    const indexInBatch = Math.max(
      Object.keys(
        allFlatEntityOperationRecordByMetadataName.objectMetadata
          ?.flatEntityToCreate ?? {},
      ).indexOf(sourceFlatObjectMetadata.universalIdentifier),
      0,
    );

    const navigationFlatCommandMenuItemToCreate =
      buildObjectNavigationUniversalFlatCommandMenuItem({
        objectMetadata: {
          id: sourceFlatObjectMetadata.id,
          universalIdentifier: sourceFlatObjectMetadata.universalIdentifier,
          nameSingular: sourceFlatObjectMetadata.nameSingular,
          shortcut: sourceFlatObjectMetadata.shortcut,
          isActive: sourceFlatObjectMetadata.isActive,
        },
        applicationUniversalIdentifier:
          sourceFlatObjectMetadata.applicationUniversalIdentifier,
        position: syncedMaxPosition + 1 + indexInBatch,
        now: new Date().toISOString(),
      });

    return {
      status: 'success',
      operations: {
        commandMenuItem: {
          flatEntityToCreate: {
            [navigationFlatCommandMenuItemToCreate.universalIdentifier]:
              navigationFlatCommandMenuItemToCreate,
          },
        },
      },
    };
  }
}
