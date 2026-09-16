import { Injectable, Logger } from '@nestjs/common';

import { appendCopySuffix, isDefined } from 'twenty-shared/utils';

import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { PageLayoutDuplicationService } from 'src/engine/metadata-modules/page-layout/services/page-layout-duplication.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import {
  getWorkspaceContext,
  type ORMWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { isObjectOperationPermitted } from 'src/engine/twenty-orm/utils/is-object-operation-permitted.util';
import { resolveObjectRecordsPermissions } from 'src/engine/twenty-orm/utils/resolve-object-records-permissions.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { DuplicatedDashboardDTO } from 'src/modules/dashboard/dtos/duplicated-dashboard.dto';
import {
  DashboardException,
  DashboardExceptionCode,
  DashboardExceptionMessageKey,
  generateDashboardExceptionMessage,
} from 'src/modules/dashboard/exceptions/dashboard.exception';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

// A role-scoped read validates every column it selects, so reading the whole
// row would refuse a duplication over a dashboard field it never copies
const DUPLICATION_SOURCE_COLUMNS: (keyof DashboardWorkspaceEntity)[] = [
  'id',
  'title',
  'pageLayoutId',
  'position',
];

const DUPLICATED_DASHBOARD_COLUMNS: (keyof DashboardWorkspaceEntity)[] = [
  ...DUPLICATION_SOURCE_COLUMNS,
  'createdAt',
  'updatedAt',
];

@Injectable()
export class DashboardDuplicationService {
  private readonly logger = new Logger(DashboardDuplicationService.name);

  constructor(
    private readonly pageLayoutDuplicationService: PageLayoutDuplicationService,
    private readonly pageLayoutService: PageLayoutService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly actorFromAuthContextService: ActorFromAuthContextService,
  ) {}

  async duplicateDashboard(
    dashboardId: string,
    authContext: WorkspaceAuthContext,
  ): Promise<DuplicatedDashboardDTO> {
    const workspace = authContext.workspace;
    const workspaceId = workspace.id;

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceContext = getWorkspaceContext();
      const rolePermissionConfig = resolveRolePermissionConfig({
        authContext: workspaceContext.authContext,
        userWorkspaceRoleMap: workspaceContext.userWorkspaceRoleMap,
        apiKeyRoleMap: workspaceContext.apiKeyRoleMap,
      });

      if (!isDefined(rolePermissionConfig)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

      const dashboardRepository =
        this.workspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
          'dashboard',
          rolePermissionConfig,
        );

      const originalDashboard = await dashboardRepository.findOne({
        where: { id: dashboardId },
        select: DUPLICATION_SOURCE_COLUMNS,
      });

      if (!isDefined(originalDashboard)) {
        throw new DashboardException(
          generateDashboardExceptionMessage(
            DashboardExceptionMessageKey.DASHBOARD_NOT_FOUND,
            dashboardId,
          ),
          DashboardExceptionCode.DASHBOARD_NOT_FOUND,
        );
      }

      if (!isDefined(originalDashboard.pageLayoutId)) {
        throw new DashboardException(
          generateDashboardExceptionMessage(
            DashboardExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
            dashboardId,
          ),
          DashboardExceptionCode.PAGE_LAYOUT_NOT_FOUND,
        );
      }

      // The layout copy lives in the core schema, outside the dashboard
      // insert, so a caller who may not create dashboards is refused before it
      this.assertCanCreateDashboardOrThrow({
        workspaceContext,
        rolePermissionConfig,
      });

      try {
        const newPageLayout = await this.pageLayoutDuplicationService.duplicate(
          {
            pageLayoutId: originalDashboard.pageLayoutId,
            workspaceId,
          },
        );

        const newDashboard = await this.createDuplicatedDashboardOrRollback({
          originalDashboard,
          newPageLayoutId: newPageLayout.id,
          dashboardRepository,
          authContext,
          workspaceId,
        });

        return {
          id: newDashboard.id,
          title: newDashboard.title,
          pageLayoutId: newDashboard.pageLayoutId,
          position: newDashboard.position,
          createdAt: new Date(newDashboard.createdAt).toISOString(),
          updatedAt: new Date(newDashboard.updatedAt).toISOString(),
        };
      } catch (error) {
        this.logger.error(
          `Failed to duplicate dashboard ${dashboardId}: ${error.message}`,
          error.stack,
        );

        throw error;
      }
    }, authContext);
  }

  private assertCanCreateDashboardOrThrow({
    workspaceContext,
    rolePermissionConfig,
  }: {
    workspaceContext: ORMWorkspaceContext;
    rolePermissionConfig: RolePermissionConfig;
  }): void {
    const { objectRecordsPermissions, shouldBypassPermissionChecks } =
      resolveObjectRecordsPermissions({
        rolePermissionConfig,
        objectPermissionsByRoleId: workspaceContext.permissionsPerRoleId,
      });

    if (shouldBypassPermissionChecks) {
      return;
    }

    const dashboardObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: workspaceContext.objectIdByNameSingular.dashboard,
      flatEntityMaps: workspaceContext.flatObjectMetadataMaps,
    });

    if (
      !isDefined(dashboardObjectMetadata) ||
      !isObjectOperationPermitted({
        objectMetadata: dashboardObjectMetadata,
        operationType: 'insert',
        objectsPermissions: objectRecordsPermissions,
      })
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }

  // The layout lives in the core schema, outside the dashboard insert, so a
  // refused or failed insert has to take the layout it was created for with it
  private async createDuplicatedDashboardOrRollback({
    originalDashboard,
    newPageLayoutId,
    dashboardRepository,
    authContext,
    workspaceId,
  }: {
    originalDashboard: DashboardWorkspaceEntity;
    newPageLayoutId: string;
    dashboardRepository: WorkspaceRepository<DashboardWorkspaceEntity>;
    authContext: WorkspaceAuthContext;
    workspaceId: string;
  }): Promise<DashboardWorkspaceEntity> {
    try {
      return await this.createDuplicatedDashboard(
        originalDashboard,
        newPageLayoutId,
        dashboardRepository,
        authContext,
      );
    } catch (error) {
      try {
        await this.pageLayoutService.destroy({
          id: newPageLayoutId,
          workspaceId,
        });
      } catch (rollbackError) {
        this.logger.error(
          `Failed to destroy page layout ${newPageLayoutId} left by a failed dashboard duplication: ${rollbackError.message}`,
          rollbackError.stack,
        );
      }

      throw error;
    }
  }

  private async createDuplicatedDashboard(
    originalDashboard: DashboardWorkspaceEntity,
    newPageLayoutId: string,
    dashboardRepository: WorkspaceRepository<DashboardWorkspaceEntity>,
    authContext: WorkspaceAuthContext,
  ): Promise<DashboardWorkspaceEntity> {
    const newTitle = appendCopySuffix(originalDashboard.title ?? '');

    const [recordWithActor] =
      await this.actorFromAuthContextService.injectActorFieldsOnCreate({
        records: [
          {
            title: newTitle,
            pageLayoutId: newPageLayoutId,
            position: originalDashboard.position,
          },
        ],
        objectMetadataNameSingular: 'dashboard',
        authContext,
      });

    const insertResult = await dashboardRepository.insert(recordWithActor);

    const newDashboardId = insertResult.identifiers[0].id;

    const newDashboard = await dashboardRepository.findOne({
      where: { id: newDashboardId },
      select: DUPLICATED_DASHBOARD_COLUMNS,
    });

    if (!isDefined(newDashboard)) {
      throw new DashboardException(
        generateDashboardExceptionMessage(
          DashboardExceptionMessageKey.DASHBOARD_DUPLICATION_FAILED,
          'Failed to retrieve created dashboard',
        ),
        DashboardExceptionCode.DASHBOARD_DUPLICATION_FAILED,
      );
    }

    return newDashboard;
  }
}
