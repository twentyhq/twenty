import { isDefined, typedObjectEntries } from 'twenty-shared/utils';

import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import {
  DERIVED_WORKSPACE_CACHE_INVALIDATION_RULES,
  type DerivedWorkspaceCacheInvalidationTrigger,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/derived-workspace-cache-invalidation-rules.constant';
import { type WorkspaceMetadataChange } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-metadata-change.type';

const isTriggeredByMetadataChange = (
  trigger: DerivedWorkspaceCacheInvalidationTrigger,
  metadataChange: WorkspaceMetadataChange,
): boolean => {
  if (trigger.metadataName !== metadataChange.metadataName) {
    return false;
  }

  if (
    isDefined(trigger.actionTypes) &&
    !trigger.actionTypes.includes(metadataChange.actionType)
  ) {
    return false;
  }

  if (
    metadataChange.actionType !== 'update' ||
    !isDefined(trigger.updatedProperties) ||
    !isDefined(metadataChange.updatedProperties)
  ) {
    return true;
  }

  const triggerUpdatedProperties: readonly string[] = trigger.updatedProperties;

  return metadataChange.updatedProperties.some((updatedProperty) =>
    triggerUpdatedProperties.includes(updatedProperty),
  );
};

export const getDerivedWorkspaceCacheKeyNamesToInvalidate = (
  metadataChanges: WorkspaceMetadataChange[],
): WorkspaceCacheKeyName[] =>
  typedObjectEntries(DERIVED_WORKSPACE_CACHE_INVALIDATION_RULES)
    .filter(([, triggers]) =>
      triggers.some((trigger: DerivedWorkspaceCacheInvalidationTrigger) =>
        metadataChanges.some((metadataChange) =>
          isTriggeredByMetadataChange(trigger, metadataChange),
        ),
      ),
    )
    .map(([cacheKeyName]) => cacheKeyName);
