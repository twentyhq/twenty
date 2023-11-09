import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import {
  TenantMigration,
  TenantMigrationTableAction,
} from './tenant-migration.entity';
import { standardMigrations } from './standard-migrations';

@Injectable()
export class TenantMigrationService {
  constructor(
    @InjectRepository(TenantMigration, 'metadata')
    private readonly tenantMigrationRepository: Repository<TenantMigration>,
  ) {}

  /**
   * Insert all standard migrations that have not been inserted yet
   *
   * @param workspaceId
   */
  public async insertStandardMigrations(workspaceId: string): Promise<void> {
    // TODO: we actually don't need to fetch all of them, to improve later so it scales well.
    const insertedStandardMigrations =
      await this.tenantMigrationRepository.find({
        where: { workspaceId, isCustom: false },
      });

    const insertedStandardMigrationsMapByName =
      insertedStandardMigrations.reduce((acc, migration) => {
        acc[migration.name] = migration;
        return acc;
      }, {});

    const standardMigrationsListThatNeedToBeInserted = Object.entries(
      standardMigrations,
    )
      .filter(([name]) => !insertedStandardMigrationsMapByName[name])
      .map(([name, migrations]) => ({ name, migrations }));

    const standardMigrationsThatNeedToBeInserted =
      standardMigrationsListThatNeedToBeInserted.map((migration) => ({
        ...migration,
        workspaceId,
        isCustom: false,
      }));

    await this.tenantMigrationRepository.save(
      standardMigrationsThatNeedToBeInserted,
    );
  }

  /**
   * Get all pending migrations for a given workspaceId
   *
   * @param workspaceId: string
   * @returns Promise<TenantMigration[]>
   */
  public async getPendingMigrations(
    workspaceId: string,
  ): Promise<TenantMigration[]> {
    return await this.tenantMigrationRepository.find({
      order: { createdAt: 'ASC' },
      where: {
        appliedAt: IsNull(),
        workspaceId,
      },
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
    await this.tenantMigrationRepository.save({
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
  public async createCustomMigration(
    workspaceId: string,
    migrations: TenantMigrationTableAction[],
  ) {
    await this.tenantMigrationRepository.save({
      migrations,
      workspaceId,
      isCustom: true,
    });
  }

  public async delete(workspaceId: string) {
    await this.tenantMigrationRepository.delete({ workspaceId });
  }
}
