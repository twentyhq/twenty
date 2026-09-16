import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class ObjectNavigationMenuItemOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'objectMetadata',
    name: 'objectNavigationMenuItemOnDelete',
    description:
      'When an object is deleted, delete every navigation menu item that can no longer resolve: the OBJECT and RECORD items pointing at it through targetObjectMetadataId (the OBJECT one is provisioned by createOneObject), and the VIEW items pointing at one of its views. Unlike the other object companions this one is not selected on isSystemSideEffect, because navigation menu items carry no such flag and a workspace-authored item pointing at the deleted object is just as dead as the provisioned one. Postgres already removes these rows on its own through the ON DELETE CASCADE foreign keys to objectMetadata and view, but it does so behind the engine back: without a delete action, navigationMenuItem is absent from the actions the runner derives its cache keys from, so flatNavigationMenuItemMaps is never invalidated and the navigationMenuItems query keeps serving items for an object that no longer exists. Folders are never touched: they carry neither a target object nor a view.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const objectViewUniversalIdentifiers = new Set(
      flatObjectMetadata.viewUniversalIdentifiers,
    );

    const navigationMenuItemToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'navigationMenuItem'>
    > = {};

    for (const flatNavigationMenuItem of Object.values(
      relatedFlatEntityMaps.flatNavigationMenuItemMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatNavigationMenuItem)) {
        continue;
      }

      const targetsDeletedObject =
        isDefined(
          flatNavigationMenuItem.targetObjectMetadataUniversalIdentifier,
        ) &&
        flatNavigationMenuItem.targetObjectMetadataUniversalIdentifier ===
          flatObjectMetadata.universalIdentifier;

      const targetsViewOfDeletedObject =
        isDefined(flatNavigationMenuItem.viewUniversalIdentifier) &&
        objectViewUniversalIdentifiers.has(
          flatNavigationMenuItem.viewUniversalIdentifier,
        );

      if (!targetsDeletedObject && !targetsViewOfDeletedObject) {
        continue;
      }

      navigationMenuItemToDelete[flatNavigationMenuItem.universalIdentifier] =
        flatNavigationMenuItem;
    }

    if (Object.keys(navigationMenuItemToDelete).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        navigationMenuItem: {
          flatEntityToDelete: navigationMenuItemToDelete,
        },
      },
    };
  }
}
