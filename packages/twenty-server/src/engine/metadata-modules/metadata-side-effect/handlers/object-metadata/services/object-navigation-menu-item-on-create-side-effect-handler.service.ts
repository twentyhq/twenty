import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { computeObjectNavigationMenuItemPositionByObjectUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-object-navigation-menu-item-position-by-object-universal-identifier.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { computeFlatObjectNavigationMenuItemToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-object-navigation-menu-item-to-create.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

@Injectable()
export class ObjectNavigationMenuItemOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectNavigationMenuItemOnCreate',
    description:
      'When an object is created, provision its workspace-level OBJECT navigation menu item (the sidebar row), owned by the application owning the object rather than by the workspace custom application. The identifier is name-free (application identifier + object identifier), so an object rename with a pinned object identifier keeps the same item. The engine always emits it and never inherits the flag: a caller row squatting on the derived identifier without isSystemSideEffect fails the migration with RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER. The one caller row it steps aside for is a workspace-level OBJECT item already targeting the object, pending or synced, whatever its identifier: unlike the record page there is no display resolver for a duplicate, the sidebar renders every row, so the singleton is enforced here and in the flat navigation menu item validator. User-scoped items (userWorkspaceId set) are user-owned and out of scope. Positions are derived from the trigger object list rather than read as max + 1 off a map snapshot, so a batch object creation (manifest sync) lays the new rows out contiguously instead of stacking them all on the same position. twenty-standard is not concerned: it synchronizes through the from/to migration path, which never runs the side-effect engine, and authors its own curated items. Note that navigationMenuItem carries no overridable property today, so a user rename, recolour, reorder or folder move of an engine-owned item is not expressed as an override; nothing rewrites it either, since this handler only runs on object creation and there is no update handler.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const sourceFlatObjectMetadata =
      flatObjectMetadata as UniversalFlatObjectMetadata;
    const { applicationUniversalIdentifier, universalIdentifier } =
      sourceFlatObjectMetadata;

    const positionByObjectUniversalIdentifier =
      computeObjectNavigationMenuItemPositionByObjectUniversalIdentifier({
        allFlatEntityOperationRecordByMetadataName,
        flatNavigationMenuItemMaps:
          relatedFlatEntityMaps.flatNavigationMenuItemMaps,
      });

    const position =
      positionByObjectUniversalIdentifier.get(universalIdentifier);

    if (!isDefined(position)) {
      return { status: 'noop' };
    }

    const flatNavigationMenuItemToCreate =
      computeFlatObjectNavigationMenuItemToCreate({
        objectMetadata: sourceFlatObjectMetadata,
        applicationUniversalIdentifier,
        position,
      });

    return {
      status: 'success',
      operations: {
        navigationMenuItem: {
          flatEntityToCreate: {
            [flatNavigationMenuItemToCreate.universalIdentifier]:
              flatNavigationMenuItemToCreate,
          },
        },
      },
    };
  }
}
