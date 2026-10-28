import { type Nullable } from '@/types';

// Indexes backing a custom field's isUnique share the workspace custom
// application but are system-managed, hence the isSystemSideEffect check.
export const isWorkspaceCustomIndex = ({
  indexMetadata,
  workspaceCustomApplicationId,
}: {
  indexMetadata: { applicationId: string; isSystemSideEffect: boolean };
  workspaceCustomApplicationId: Nullable<string>;
}): boolean =>
  indexMetadata.applicationId === workspaceCustomApplicationId &&
  !indexMetadata.isSystemSideEffect;
