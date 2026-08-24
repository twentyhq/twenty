import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { buildObjectNavigationFlatCommandMenuItemToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/build-object-navigation-flat-command-menu-item-to-create.util';
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
      'When an object is created, provision its singleton "Go to" navigation command menu item (engineComponentKey NAVIGATION with an { objectMetadataItemId } payload), isSystemSideEffect so the engine owns its lifecycle. Label, shortLabel and icon are interpolation templates resolved from the object at render time, the availability expression gates on the object read permission (plus a feature flag for gated standard objects), and hotKeys derive from the object shortcut. The identifier is name-free and keyed on (application, object) through getNavigationCommandUniversalIdentifier, so an object rename keeps the same command. Noop when the object is created inactive (the update handler provisions the command on enable), when an engine-owned navigation command already targets the object pending or synced, whatever its identifier, or when the object create carries no workspace id (the manifest sync path mints entity ids after side-effect expansion, so the NAVIGATION payload could not reference the object; app-manifest objects keep their current behavior of no auto-provisioned navigation command). A caller-authored row targeting the object never suppresses the emission: the engine is the sole authority for isSystemSideEffect entities, so it emits and the collision detector turns the squat into RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER rather than silently standing down. Position is derived deterministically from the synced maximum plus the object index in the creation batch, so batch object creation never double-books a position. twenty-standard is not concerned: it synchronizes through the from/to migration path, which never runs the side-effect engine, and seeds one navigation command per active object itself.',
  },
) {
  buildSideEffects({
    flatEntity,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const sourceFlatObjectMetadata = flatEntity as UniversalFlatObjectMetadata &
      Partial<{ id: string }>;

    if (!sourceFlatObjectMetadata.isActive) {
      return { status: 'noop' };
    }

    if (!isDefined(sourceFlatObjectMetadata.id)) {
      return { status: 'noop' };
    }

    const navigationFlatCommandMenuItemToCreate =
      buildObjectNavigationFlatCommandMenuItemToCreate({
        objectMetadata: {
          id: sourceFlatObjectMetadata.id,
          universalIdentifier: sourceFlatObjectMetadata.universalIdentifier,
          nameSingular: sourceFlatObjectMetadata.nameSingular,
          shortcut: sourceFlatObjectMetadata.shortcut,
          commandMenuItemUniversalIdentifiers:
            sourceFlatObjectMetadata.commandMenuItemUniversalIdentifiers,
        },
        applicationUniversalIdentifier:
          sourceFlatObjectMetadata.applicationUniversalIdentifier,
        pendingFlatCommandMenuItemsToCreate:
          allFlatEntityOperationRecordByMetadataName.commandMenuItem
            ?.flatEntityToCreate ?? {},
        syncedFlatCommandMenuItemMaps:
          relatedFlatEntityMaps.flatCommandMenuItemMaps,
        batchObjectUniversalIdentifiers: Object.keys(
          allFlatEntityOperationRecordByMetadataName.objectMetadata
            ?.flatEntityToCreate ?? {},
        ),
      });

    if (!isDefined(navigationFlatCommandMenuItemToCreate)) {
      return { status: 'noop' };
    }

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
