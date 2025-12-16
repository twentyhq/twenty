import { Injectable, Logger } from '@nestjs/common';

import { appendCopySuffix, isDefined } from 'twenty-shared/utils';

import { PageLayoutDuplicationService } from 'src/engine/metadata-modules/page-layout/services/page-layout-duplication.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
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
  ) {}

  async duplicateDashboard(
    dashboardId: string,
    workspaceId: string,
  ): Promise<DuplicatedDashboardDTO> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      buildSystemAuthContext(workspaceId),
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
    );
  }

  private async createDuplicatedDashboard(
    originalDashboard: DashboardWorkspaceEntity,
    newPageLayoutId: string,
    dashboardRepository: WorkspaceRepository<DashboardWorkspaceEntity>,
  ): Promise<DashboardWorkspaceEntity> {
    const newTitle = appendCopySuffix(originalDashboard.title ?? '');

    const insertResult = await dashboardRepository.insert({
      title: newTitle,
      pageLayoutId: newPageLayoutId,
      position: originalDashboard.position,
    });

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
