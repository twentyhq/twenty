import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { AsyncLocalStorage } from 'async_hooks';

import { type FeatureFlagKey } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatValidationRuleMaps } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule-maps.type';

export type ORMWorkspaceContext = {
  authContext: WorkspaceAuthContext;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  objectIdByNameSingular: Record<string, string>;
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
  billingEntitlements: BillingEntitlements;
  permissionsPrincipals: PermissionsPrincipalsWithRolesContext | undefined;
  recordReadRestrictions: RecordReadRestrictions;
  flatValidationRuleMaps?: FlatValidationRuleMaps;
};

export const workspaceContextStorage =
  new AsyncLocalStorage<ORMWorkspaceContext>();

export const getWorkspaceContext = (): ORMWorkspaceContext => {
  const context = workspaceContextStorage.getStore();

  if (!context) {
    throw new Error(
      'Workspace context not set. Operations must be wrapped with withWorkspaceContext()',
    );
  }

  return context;
};

export const withWorkspaceContext = <T>(
  context: ORMWorkspaceContext,
  fn: () => T | Promise<T>,
): T | Promise<T> => {
  return workspaceContextStorage.run(context, fn);
};

export const setWorkspaceContext = (context: ORMWorkspaceContext): void => {
  workspaceContextStorage.enterWith(context);
};
