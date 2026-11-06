import { isValidationRuleEnforcementEnabled } from 'src/engine/twenty-orm/utils/is-validation-rule-enforcement-enabled.util';
import { Injectable, type Type } from '@nestjs/common';

import { type ObjectLiteral } from 'typeorm';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { ExecuteInWorkspaceContextOptions } from 'src/engine/twenty-orm/types/execute-in-workspace-context-options.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import {
  type ORMWorkspaceContext,
  withWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type WorkspaceRepositoryOptions } from 'src/engine/twenty-orm/types/workspace-repository-options.type';
import { WorkspaceDataSourceService } from 'src/engine/twenty-orm/datasource/workspace-data-source.service';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/utils/convert-class-to-object-metadata-name.util';
import { NO_RECORD_READ_RESTRICTIONS } from 'src/engine/permissions/constants/no-record-read-restrictions.constant';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';

type OrmRepositoryOptions = WorkspaceRepositoryOptions & {
  useReplica?: boolean;
};

@Injectable()
export class WorkspaceOrmManager {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly enterprisePlanService: EnterprisePlanService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly principalPermissionsService: PrincipalPermissionsService,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  getRepository<T extends ObjectLiteral = ObjectRecord>(
    workspaceEntityOrObjectMetadataName: Type<T> | string,
    repositoryOptions?: OrmRepositoryOptions,
  ): WorkspaceRepository<T> {
    return this.getDataSource(repositoryOptions).getRepository<T>(
      this.resolveObjectMetadataName(workspaceEntityOrObjectMetadataName),
      { shouldSkipEventEmission: repositoryOptions?.shouldSkipEventEmission },
    );
  }

  // Only for work the system does itself, never on behalf of a caller
  getRepositoryWithoutPermissionChecks<T extends ObjectLiteral = ObjectRecord>(
    workspaceEntityOrObjectMetadataName: Type<T> | string,
    repositoryOptions?: OrmRepositoryOptions,
  ): WorkspaceRepository<T> {
    return this.getDataSource(
      repositoryOptions,
    ).getRepositoryWithoutPermissionChecks<T>(
      this.resolveObjectMetadataName(workspaceEntityOrObjectMetadataName),
      { shouldSkipEventEmission: repositoryOptions?.shouldSkipEventEmission },
    );
  }

  private getDataSource(repositoryOptions?: OrmRepositoryOptions) {
    return this.workspaceDataSourceService.getDataSource({
      useReplica: repositoryOptions?.useReplica ?? false,
    });
  }

  private resolveObjectMetadataName<T extends ObjectLiteral>(
    workspaceEntityOrObjectMetadataName: Type<T> | string,
  ): string {
    if (typeof workspaceEntityOrObjectMetadataName === 'string') {
      return workspaceEntityOrObjectMetadataName;
    }

    return convertClassNameToObjectMetadataName(
      workspaceEntityOrObjectMetadataName.name,
    );
  }

  async runInWorkspaceTransaction<T>(
    work: (transactionScope: WorkspaceTransactionScope) => Promise<T>,
  ): Promise<T> {
    return this.workspaceDataSourceService
      .getDataSource({ useReplica: false })
      .transaction(work);
  }

  async executeInWorkspaceContext<T>(
    fn: () => T | Promise<T>,
    authContext?: WorkspaceAuthContext,
    options?: ExecuteInWorkspaceContextOptions,
  ): Promise<T> {
    const resolvedAuthContext = authContext ?? getWorkspaceAuthContext();
    const context = options?.lite
      ? await this.loadLiteWorkspaceContext(resolvedAuthContext)
      : await this.loadWorkspaceContext(resolvedAuthContext);

    return withWorkspaceContext(context, fn);
  }

  async executeTransactionInWorkspaceContext<TResult>(
    work: (transactionScope: WorkspaceTransactionScope) => Promise<TResult>,
    authContext?: WorkspaceAuthContext,
    options?: ExecuteInWorkspaceContextOptions,
  ): Promise<TResult> {
    return this.executeInWorkspaceContext(
      () => this.runInWorkspaceTransaction(work),
      authContext,
      options,
    );
  }

  private async loadWorkspaceContext(
    authContext: WorkspaceAuthContext,
  ): Promise<ORMWorkspaceContext> {
    const workspaceId = authContext.workspace.id;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMapsOrm,
      flatIndexMaps,
      featureFlagsMap,
      billingEntitlements,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMapsOrm',
      'flatIndexMaps',
      'featureFlagsMap',
      'billingEntitlements',
    ]);

    const { idByNameSingular: objectIdByNameSingular } =
      buildObjectIdByNameMaps(flatObjectMetadataMaps);

    const permissionsPrincipals =
      await this.principalPermissionsService.resolvePermissionsPrincipals({
        authContext,
      });
    const recordReadRestrictions = isDefined(permissionsPrincipals)
      ? await this.recordPermissionsService.findRecordReadRestrictions({
          principals: permissionsPrincipals,
        })
      : NO_RECORD_READ_RESTRICTIONS;

    const flatValidationRuleMaps = isValidationRuleEnforcementEnabled({
      billingEntitlements,
      hasValidEnterprisePlan: this.enterprisePlanService.isValid(),
      isBillingEnabled: this.twentyConfigService.get('IS_BILLING_ENABLED'),
    })
      ? (
          await this.workspaceCacheService.getOrRecompute(workspaceId, [
            'flatValidationRuleMaps',
          ])
        ).flatValidationRuleMaps
      : undefined;

    return {
      authContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      flatIndexMaps,
      flatValidationRuleMaps,
      objectIdByNameSingular,
      featureFlagsMap,
      billingEntitlements,
      permissionsPrincipals,
      recordReadRestrictions,
    };
  }

  private async loadLiteWorkspaceContext(
    authContext: WorkspaceAuthContext,
  ): Promise<ORMWorkspaceContext> {
    const workspaceId = authContext.workspace.id;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMapsOrm,
      billingEntitlements,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMapsOrm',
      'billingEntitlements',
    ]);

    const { idByNameSingular: objectIdByNameSingular } =
      buildObjectIdByNameMaps(flatObjectMetadataMaps);

    return {
      authContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      flatIndexMaps: {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      },
      objectIdByNameSingular,
      featureFlagsMap: {} as ORMWorkspaceContext['featureFlagsMap'],
      billingEntitlements,
      permissionsPrincipals: undefined,
      recordReadRestrictions: NO_RECORD_READ_RESTRICTIONS,
    };
  }
}
