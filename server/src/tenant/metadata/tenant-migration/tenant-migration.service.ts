import { Injectable } from '@nestjs/common';

import { IsNull } from 'typeorm';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';

import {
  TenantMigration,
  TenantMigrationTableChange,
} from './tenant-migration.entity';

@Injectable()
export class TenantMigrationService {
  constructor(private readonly dataSourceService: DataSourceService) {}

  /**
   * Get all pending migrations for a given workspaceId
   *
   * @param workspaceId: string
   * @returns Promise<TenantMigration[]>
   */
  public async getPendingMigrations(
    workspaceId: string,
  ): Promise<TenantMigration[]> {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const tenantMigrationRepository =
      workspaceDataSource.getRepository(TenantMigration);

    return tenantMigrationRepository.find({
      order: { createdAt: 'ASC' },
      where: { appliedAt: IsNull() },
    });
  }

  /**
   * Set appliedAt as current date for a given migration.
   * Should be called once the migration has been applied
   *
   * @param workspaceId: string
   * @param migration: TenantMigration
   */
  public async setAppliedAtForMigration(
    workspaceId: string,
    migration: TenantMigration,
  ) {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const tenantMigrationRepository =
      workspaceDataSource.getRepository(TenantMigration);

    await tenantMigrationRepository.save({
      id: migration.id,
      appliedAt: new Date(),
    });
  }

  /**
   * Create a new pending migration for a given workspaceId and expected changes
   *
   * @param workspaceId
   * @param migrations
   */
  public async createMigration(
    workspaceId: string,
    migrations: TenantMigrationTableChange[],
  ) {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const tenantMigrationRepository =
      workspaceDataSource.getRepository(TenantMigration);

    await tenantMigrationRepository.save({
      migrations,
    });
  }
}
