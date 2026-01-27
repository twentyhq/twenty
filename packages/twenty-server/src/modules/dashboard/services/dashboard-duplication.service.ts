import { Injectable, Logger } from '@nestjs/common';

import {
  appendCopySuffix,
  assertIsDefinedOrThrow,
  isDefined,
} from 'twenty-shared/utils';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { PageLayoutDuplicationService } from 'src/engine/metadata-modules/page-layout/services/page-layout-duplication.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { DuplicatedDashboardDTO } from 'src/modules/dashboard/dtos/duplicated-dashboard.dto';
import {
  DashboardException,
  DashboardExceptionCode,
  DashboardExceptionMessageKey,
  generateDashboardExceptionMessage,
} from 'src/modules/dashboard/exceptions/dashboard.exception';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

@Injectable()
export class DashboardDuplicationService {
  private readonly logger = new Logger(DashboardDuplicationService.name);

  constructor(
    private readonly pageLayoutDuplicationService: PageLayoutDuplicationService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly actorFromAuthContextService: ActorFromAuthContextService,
  ) {}

  async duplicateDashboard(
    dashboardId: string,
    authContext: AuthContext,
  ): Promise<DuplicatedDashboardDTO> {
    const { workspace } = authContext;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const workspaceId = workspace.id;

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const dashboardRepository =
          await this.globalWorkspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
            workspaceId,
            'dashboard',
            { shouldBypassPermissionChecks: true },
          );

        const originalDashboard = await dashboardRepository.findOne({
          where: { id: dashboardId },
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

        try {
          const newPageLayout =
            await this.pageLayoutDuplicationService.duplicate({
              pageLayoutId: originalDashboard.pageLayoutId,
              workspaceId,
            });

          const newDashboard = await this.createDuplicatedDashboard(
            originalDashboard,
            newPageLayout.id,
            dashboardRepository,
            authContext,
          );

          return {
            id: newDashboard.id,
            title: newDashboard.title,
            pageLayoutId: newDashboard.pageLayoutId,
            position: newDashboard.position,
            createdAt: newDashboard.createdAt,
            updatedAt: newDashboard.updatedAt,
          };
        } catch (error) {
          this.logger.error(
            `Failed to duplicate dashboard ${dashboardId}: ${error.message}`,
            error.stack,
          );

          throw error;
        }
      },
      authContext as WorkspaceAuthContext,
    );
  }

  private async createDuplicatedDashboard(
    originalDashboard: DashboardWorkspaceEntity,
    newPageLayoutId: string,
    dashboardRepository: WorkspaceRepository<DashboardWorkspaceEntity>,
    authContext: AuthContext,
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
