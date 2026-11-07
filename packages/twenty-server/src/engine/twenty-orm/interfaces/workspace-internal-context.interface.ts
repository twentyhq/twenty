import { type RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type DataSource } from 'typeorm';
import { type FeatureFlagKey } from 'twenty-shared/types';

import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';
import { type WorkspaceRecordStockService } from 'src/engine/core-modules/usage-limit/services/workspace-record-stock.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatValidationRuleMaps } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule-maps.type';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

export interface WorkspaceInternalContext {
  workspaceId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  flatValidationRuleMaps?: FlatValidationRuleMaps;
  objectIdByNameSingular: Record<string, string>;
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
  billingEntitlements: BillingEntitlements;
  eventEmitterService: Pick<WorkspaceEventEmitter, 'emitDatabaseBatchEvent'>;
  permissionsPrincipals: PermissionsPrincipalsWithRolesContext | undefined;
  recordReadRestrictions: RecordReadRestrictions;
  recordPermissions: Pick<
    RecordPermissionsService,
    | 'isReadDisabled'
    | 'assertCanRunOperationOrThrow'
    | 'buildRecordsAccessCondition'
    | 'assertCreatedRecordsMatchRowLevelPermissionsOrThrow'
    | 'assertUpdatesKeepRecordAccessOrThrow'
  >;
  recordStock: Pick<
    WorkspaceRecordStockService,
    'assertRecordStockAvailable' | 'acquireRecordStock' | 'releaseRecordStock'
  >;
  coreDataSource: DataSource;
}
