import { AsyncLocalStorage } from 'async_hooks';

import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';

import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export type WorkspaceContextForStorage = {
  workspaceId: string;
  objectMetadataMaps: ObjectMetadataMaps;
  metadataVersion: number;
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
  permissionsPerRoleId: ObjectsPermissionsByRoleId;
};

export const workspaceContextStorage =
  new AsyncLocalStorage<WorkspaceContextForStorage>();

export const getWorkspaceContext = (): WorkspaceContextForStorage => {
  const context = workspaceContextStorage.getStore();

  if (!context) {
    throw new Error(
      'Workspace context not set. Operations must be wrapped with withWorkspaceContext()',
    );
  }

  return context;
};

export const withWorkspaceContext = <T>(
  context: WorkspaceContextForStorage,
  fn: () => T | Promise<T>,
): T | Promise<T> => {
  return workspaceContextStorage.run(context, fn);
};

export const setWorkspaceContext = (
  context: WorkspaceContextForStorage,
): void => {
  workspaceContextStorage.enterWith(context);
};
