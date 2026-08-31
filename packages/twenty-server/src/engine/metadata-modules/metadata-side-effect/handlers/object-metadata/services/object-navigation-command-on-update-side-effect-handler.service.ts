import { msg, t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import { getSystemNavigationCommandMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { buildNavigationConditionalAvailabilityExpression } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class ObjectNavigationCommandOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'objectMetadata',
    name: 'objectNavigationCommandOnUpdate',
    description:
      'When an object is updated, keep its navigation command menu item in sync with the fields it denormalizes: follow an isActive toggle (deactivate soft-disables rather than deletes, the correct semantics for an overridable entity), recompute conditionalAvailabilityExpression when nameSingular changes (the expression embeds nameSingular, so a rename would otherwise leave the permission gate pointing at a name that no longer exists), and recompute hotKeys when the shortcut changes. The command is resolved by its derived (application, object) identifier, so a workspace whose rows the 2-38 re-own has not converged yet keeps the stale expression until that command runs rather than being reconciled here. Only an engine-owned command is touched. Noops when none of isActive, nameSingular or shortcut changed and when the resulting state already matches.',
  },
) {
  buildSideEffects({
    flatEntity: updatedFlatObjectMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
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
      relatedFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
        getSystemNavigationCommandMenuItemUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            existingFlatObjectMetadata.applicationUniversalIdentifier,
          objectUniversalIdentifier:
            existingFlatObjectMetadata.universalIdentifier,
        })
      ];

    if (
      !isDefined(existingNavigationFlatCommandMenuItem) ||
      existingNavigationFlatCommandMenuItem.isSystemSideEffect !== true
    ) {
      return { status: 'noop' };
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
}
