import { msg, t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  buildNavigationConditionalAvailabilityExpression,
  buildNavigationUniversalFlatCommandMenuItem,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import { findObjectNavigationFlatCommandMenuItem } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/find-object-navigation-flat-command-menu-item.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

@Injectable()
export class ObjectNavigationCommandOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'objectMetadata',
    name: 'objectNavigationCommandOnUpdate',
    description:
      'When an object is updated, keep its engine-owned navigation command menu item in sync with the fields it denormalizes: follow an isActive toggle (deactivate soft-disables the command rather than deleting it, the correct semantics for an overridable entity), recompute conditionalAvailabilityExpression when nameSingular changes (the expression embeds the mutable nameSingular, so a rename would otherwise leave the permission gate pointing at a name that no longer exists), and recompute hotKeys when the shortcut changes. The command is resolved by target object, whatever its identifier, so workspaces not yet re-owned onto the derived (application, object) identifier are followed too. Enabling an object that has no navigation command yet (created inactive, or a legacy row was hard-deleted) provisions one, engine-owned. Noop when none of isActive, nameSingular or shortcut changed, when the object cannot be resolved from the synced maps, or when nothing about the resolved command would change.',
  },
) {
  buildSideEffects({
    flatEntity,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const updatedFlatObjectMetadata = flatEntity as UniversalFlatObjectMetadata;

    const existingFlatObjectMetadata =
      relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        updatedFlatObjectMetadata.universalIdentifier
      ];

    if (!isDefined(existingFlatObjectMetadata)) {
      return {
        status: 'fail',
        type: 'update',
        metadataName: 'objectMetadata',
        flatEntityMinimalInformation: {
          universalIdentifier: updatedFlatObjectMetadata.universalIdentifier,
        } as Partial<MetadataFlatEntity<'objectMetadata'>>,
        errors: [
          {
            code: MetadataSideEffectExceptionCode.SIDE_EFFECT_PARENT_METADATA_NOT_FOUND,
            message: t`Could not resolve the existing object to reconcile its navigation command menu item`,
            userFriendlyMessage: msg`The object to update could not be found to reconcile its navigation command`,
          },
        ],
      };
    }

    const isActiveChanged =
      updatedFlatObjectMetadata.isActive !==
      existingFlatObjectMetadata.isActive;
    const nameSingularChanged =
      updatedFlatObjectMetadata.nameSingular !==
      existingFlatObjectMetadata.nameSingular;
    const shortcutChanged =
      updatedFlatObjectMetadata.shortcut !==
      existingFlatObjectMetadata.shortcut;

    if (!isActiveChanged && !nameSingularChanged && !shortcutChanged) {
      return { status: 'noop' };
    }

    const existingNavigationFlatCommandMenuItem =
      findObjectNavigationFlatCommandMenuItem({
        commandMenuItems: Object.values(
          relatedFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier,
        ),
        objectMetadataId: existingFlatObjectMetadata.id,
        objectUniversalIdentifier:
          updatedFlatObjectMetadata.universalIdentifier,
        applicationUniversalIdentifier:
          updatedFlatObjectMetadata.applicationUniversalIdentifier,
      });

    if (!isDefined(existingNavigationFlatCommandMenuItem)) {
      const isBeingEnabled =
        isActiveChanged && updatedFlatObjectMetadata.isActive;

      if (!isBeingEnabled) {
        return { status: 'noop' };
      }

      return this.buildCreateOperationsForEnabledObject({
        updatedFlatObjectMetadata,
        existingFlatObjectMetadataId: existingFlatObjectMetadata.id,
        allFlatEntityOperationRecordByMetadataName,
        relatedFlatEntityMaps,
      });
    }

    const navigationFlatCommandMenuItemToUpdate = {
      ...existingNavigationFlatCommandMenuItem,
      ...(isActiveChanged
        ? { isActive: updatedFlatObjectMetadata.isActive }
        : {}),
      ...(nameSingularChanged
        ? {
            conditionalAvailabilityExpression:
              buildNavigationConditionalAvailabilityExpression({
                universalIdentifier:
                  updatedFlatObjectMetadata.universalIdentifier,
                nameSingular: updatedFlatObjectMetadata.nameSingular,
              }),
          }
        : {}),
      ...(shortcutChanged
        ? {
            hotKeys: isDefined(updatedFlatObjectMetadata.shortcut)
              ? ['G', updatedFlatObjectMetadata.shortcut]
              : null,
          }
        : {}),
    };

    const hasChanges = (
      ['isActive', 'conditionalAvailabilityExpression', 'hotKeys'] as const
    ).some(
      (property) =>
        JSON.stringify(navigationFlatCommandMenuItemToUpdate[property]) !==
        JSON.stringify(existingNavigationFlatCommandMenuItem[property]),
    );

    if (!hasChanges) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        commandMenuItem: {
          flatEntityToUpdate: {
            [navigationFlatCommandMenuItemToUpdate.universalIdentifier]:
              navigationFlatCommandMenuItemToUpdate as unknown as MetadataUniversalFlatEntity<'commandMenuItem'>,
          },
        },
      },
    };
  }

  private buildCreateOperationsForEnabledObject({
    updatedFlatObjectMetadata,
    existingFlatObjectMetadataId,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: {
    updatedFlatObjectMetadata: UniversalFlatObjectMetadata;
    existingFlatObjectMetadataId: string;
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'objectMetadata'>['allFlatEntityOperationRecordByMetadataName'];
    relatedFlatEntityMaps: BuildSideEffectsArgs<'objectMetadata'>['relatedFlatEntityMaps'];
  }): MetadataSideEffectResult {
    const pendingNavigationFlatCommandMenuItem =
      findObjectNavigationFlatCommandMenuItem({
        commandMenuItems: Object.values(
          allFlatEntityOperationRecordByMetadataName.commandMenuItem
            ?.flatEntityToCreate ?? {},
        ),
        objectMetadataId: existingFlatObjectMetadataId,
        objectUniversalIdentifier:
          updatedFlatObjectMetadata.universalIdentifier,
        applicationUniversalIdentifier:
          updatedFlatObjectMetadata.applicationUniversalIdentifier,
      });

    if (isDefined(pendingNavigationFlatCommandMenuItem)) {
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

    const batchObjectUniversalIdentifiers = Object.keys(
      allFlatEntityOperationRecordByMetadataName.objectMetadata
        ?.flatEntityToUpdate ?? {},
    );
    const indexInUpdateBatch = Math.max(
      batchObjectUniversalIdentifiers.indexOf(
        updatedFlatObjectMetadata.universalIdentifier,
      ),
      0,
    );

    const navigationFlatCommandMenuItemToCreate =
      buildNavigationUniversalFlatCommandMenuItem({
        objectMetadata: {
          id: existingFlatObjectMetadataId,
          universalIdentifier: updatedFlatObjectMetadata.universalIdentifier,
          nameSingular: updatedFlatObjectMetadata.nameSingular,
          shortcut: updatedFlatObjectMetadata.shortcut,
        },
        applicationUniversalIdentifier:
          updatedFlatObjectMetadata.applicationUniversalIdentifier,
        position: syncedMaxPosition + 1 + indexInUpdateBatch,
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
