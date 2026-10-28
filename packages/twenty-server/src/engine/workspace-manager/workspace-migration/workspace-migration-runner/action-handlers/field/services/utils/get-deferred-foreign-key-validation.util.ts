import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action.type';
import { type DeferredWorkspaceMigrationActionPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';

export const getDeferredForeignKeyValidation = ({
  flatAction,
  shouldDeferActions,
}: {
  flatAction: FlatCreateFieldAction;
  shouldDeferActions?: boolean;
}):
  | {
      name: 'validate_foreignKey';
      payload: DeferredWorkspaceMigrationActionPayload<'validate_foreignKey'>;
    }
  | undefined => {
  if (!shouldDeferActions) {
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
    name: 'validate_foreignKey' as const,
    payload: { fieldMetadataId: flatFieldMetadata.id },
  };
};
