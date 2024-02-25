import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

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
    name: string,
    workspaceId: string,
    migrations: WorkspaceMigrationTableAction[],
  ) {
    await this.workspaceMigrationRepository.save({
      name,
      migrations,
      workspaceId,
      isCustom: true,
    });
  }

  public async delete(workspaceId: string) {
    await this.workspaceMigrationRepository.delete({ workspaceId });
  }
}
