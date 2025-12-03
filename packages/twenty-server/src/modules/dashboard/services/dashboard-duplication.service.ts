import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource, EntityManager } from 'typeorm';

import { PageLayoutDuplicationService } from 'src/engine/core-modules/page-layout/services/page-layout-duplication.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { DashboardDTO } from 'src/modules/dashboard/dtos/dashboard.dto';
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
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async duplicateDashboard(
    dashboardId: string,
    workspaceId: string,
  ): Promise<DashboardDTO> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newDashboard = await this.duplicateDashboardWithinTransaction(
        dashboardId,
        workspaceId,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      return {
        id: newDashboard.id,
        title: newDashboard.title,
        pageLayoutId: newDashboard.pageLayoutId,
        position: newDashboard.position,
        createdAt: newDashboard.createdAt,
        updatedAt: newDashboard.updatedAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `Failed to duplicate dashboard ${dashboardId}: ${error.message}`,
        error.stack,
      );

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async duplicateDashboardWithinTransaction(
    dashboardId: string,
    workspaceId: string,
    transactionManager: EntityManager,
  ): Promise<DashboardWorkspaceEntity> {
    const dashboardRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<DashboardWorkspaceEntity>(
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

    const newPageLayout = await this.pageLayoutDuplicationService.duplicate({
      pageLayoutId: originalDashboard.pageLayoutId,
      workspaceId,
      transactionManager,
    });

    const newDashboard = await this.createDuplicatedDashboard(
      originalDashboard,
      newPageLayout.id,
      dashboardRepository,
    );

    return newDashboard;
  }

  private async createDuplicatedDashboard(
    originalDashboard: DashboardWorkspaceEntity,
    newPageLayoutId: string,
    dashboardRepository: Awaited<
      ReturnType<
        typeof this.twentyORMGlobalManager.getRepositoryForWorkspace<DashboardWorkspaceEntity>
      >
    >,
  ): Promise<DashboardWorkspaceEntity> {
    const newTitle = originalDashboard.title
      ? `${originalDashboard.title} (Copy)`
      : '(Copy)';

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
