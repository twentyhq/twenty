import { AsyncLocalStorage } from 'async_hooks';

import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { type EntitySchema } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export type WorkspaceContext = {
  authContext: WorkspaceAuthContext;
  objectMetadataMaps: ObjectMetadataMaps;
  metadataVersion: number;
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
  permissionsPerRoleId: ObjectsPermissionsByRoleId;
  entitySchemas: EntitySchema[];
};

export const workspaceContextStorage =
  new AsyncLocalStorage<WorkspaceContext>();

export const getWorkspaceContext = (): WorkspaceContext => {
  const context = workspaceContextStorage.getStore();

  if (!context) {
    throw new Error(
      'Workspace context not set. Operations must be wrapped with withWorkspaceContext()',
    );
  }

  return context;
};

export const withWorkspaceContext = <T>(
  context: WorkspaceContext,
  fn: () => T | Promise<T>,
): T | Promise<T> => {
  return workspaceContextStorage.run(context, fn);
};

export const setWorkspaceContext = (context: WorkspaceContext): void => {
  workspaceContextStorage.enterWith(context);
};
