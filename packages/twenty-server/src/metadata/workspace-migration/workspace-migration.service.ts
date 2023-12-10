import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { standardMigrations } from './standard-migrations';
import {
  WorkspaceMigrationEntity,
  WorkspaceMigrationTableAction,
} from './workspace-migration.entity';

@Injectable()
export class WorkspaceMigrationService {
  constructor(
    @InjectRepository(WorkspaceMigrationEntity, 'metadata')
    private readonly workspaceMigrationRepository: Repository<WorkspaceMigrationEntity>,
  ) {}

  /**
   * Insert all standard migrations that have not been inserted yet
   *
   * @param workspaceId
   */
  public async insertStandardMigrations(workspaceId: string): Promise<void> {
    // TODO: we actually don't need to fetch all of them, to improve later so it scales well.
    const insertedStandardMigrations =
      await this.workspaceMigrationRepository.find({
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

    await this.workspaceMigrationRepository.save(
      standardMigrationsThatNeedToBeInserted,
    );
  }

  /**
   * Get all pending migrations for a given workspaceId
   *
   * @param workspaceId: string
   * @returns Promise<WorkspaceMigration[]>
   */
  public async getPendingMigrations(
    workspaceId: string,
  ): Promise<WorkspaceMigrationEntity[]> {
    return await this.workspaceMigrationRepository.find({
      order: { createdAt: 'ASC', name: 'ASC' },
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
   * @param migration: WorkspaceMigration
   */
  public async setAppliedAtForMigration(
    workspaceId: string,
    migration: WorkspaceMigrationEntity,
  ) {
    await this.workspaceMigrationRepository.save({
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
    migrations: WorkspaceMigrationTableAction[],
  ) {
    await this.workspaceMigrationRepository.save({
      migrations,
      workspaceId,
      isCustom: true,
    });
  }

  public async delete(workspaceId: string) {
    await this.workspaceMigrationRepository.delete({ workspaceId });
  }
}
