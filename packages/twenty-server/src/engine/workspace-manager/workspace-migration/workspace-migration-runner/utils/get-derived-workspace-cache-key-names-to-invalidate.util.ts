import { isDefined, typedObjectEntries } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';
import { DERIVED_WORKSPACE_CACHE_INVALIDATION_RULES } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/derived-workspace-cache-invalidation-rules.constant';
import { type DerivedWorkspaceCacheInvalidationTrigger } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/derived-workspace-cache-invalidation-trigger.type';

type InvalidatingAction =
  | Pick<
      AllUniversalWorkspaceMigrationAction<'create' | 'delete'>,
      'metadataName' | 'type'
    >
  | Pick<
      AllUniversalWorkspaceMigrationAction<'update'>,
      'metadataName' | 'type' | 'update'
    >;

const isTriggeredByAction = (
  trigger: DerivedWorkspaceCacheInvalidationTrigger,
  action: InvalidatingAction,
): boolean => {
  if (
    trigger.metadataName !== action.metadataName ||
    (isDefined(trigger.actionTypes) &&
      !trigger.actionTypes.includes(action.type))
  ) {
    return false;
  }

  if (action.type !== 'update' || !isDefined(trigger.updatedProperties)) {
    return true;
  }

  const triggerUpdatedProperties: readonly string[] = trigger.updatedProperties;

  return Object.keys(action.update).some((updatedProperty) =>
    triggerUpdatedProperties.includes(updatedProperty),
  );
};

export const getDerivedWorkspaceCacheKeyNamesToInvalidate = ({
  allFlatEntityMapsKeys,
  actions,
}: {
  allFlatEntityMapsKeys: (keyof AllFlatEntityMaps)[];
  actions?: InvalidatingAction[];
}): WorkspaceCacheKeyName[] =>
  typedObjectEntries(DERIVED_WORKSPACE_CACHE_INVALIDATION_RULES)
    .filter(([, triggers]) =>
      triggers.some((trigger: DerivedWorkspaceCacheInvalidationTrigger) =>
        isDefined(actions)
          ? actions.some((action) => isTriggeredByAction(trigger, action))
          : // Without the actions, any change to the given maps has to be assumed
            allFlatEntityMapsKeys.includes(
              getMetadataFlatEntityMapsKey(trigger.metadataName),
            ),
      ),
    )
    .map(([cacheKeyName]) => cacheKeyName);
