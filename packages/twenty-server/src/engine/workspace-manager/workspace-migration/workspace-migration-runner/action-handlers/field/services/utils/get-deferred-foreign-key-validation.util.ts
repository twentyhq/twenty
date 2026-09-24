import { FeatureFlagKey, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { type DeferredWorkspaceMigrationActionPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';

export const getDeferredForeignKeyValidation = ({
  flatAction,
  featureFlagsMap,
}: {
  flatAction: FlatCreateFieldAction;
  featureFlagsMap?: Partial<FeatureFlagMap>;
}):
  | {
      name: 'validateForeignKey';
      payload: DeferredWorkspaceMigrationActionPayload<'validateForeignKey'>;
    }
  | undefined => {
  if (
    !featureFlagsMap?.[
      FeatureFlagKey.IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED
    ]
  ) {
    return undefined;
  }

  const flatFieldMetadata = [
    flatAction.flatEntity,
    flatAction.relatedFlatFieldMetadata,
  ]
    .filter(isDefined)
    .find(
      (createdFlatFieldMetadata) =>
        isMorphOrRelationFlatFieldMetadata(createdFlatFieldMetadata) &&
        createdFlatFieldMetadata.settings?.relationType ===
          RelationType.MANY_TO_ONE,
    );

  if (!isDefined(flatFieldMetadata)) {
    return undefined;
  }

  return {
    name: 'validateForeignKey' as const,
    payload: { fieldMetadataId: flatFieldMetadata.id },
  };
};
