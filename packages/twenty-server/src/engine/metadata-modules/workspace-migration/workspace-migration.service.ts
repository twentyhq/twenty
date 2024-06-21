import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Not, Repository } from 'typeorm';

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
   * Get all applied migrations for a given workspaceId
   *
   * @params
   * workspaceId: string
   * @returns Promise<WorkspaceMigration[]>
   */
  public async getAppliedMigrations(
    workspaceId: string,
  ): Promise<WorkspaceMigrationEntity[]> {
    return await this.workspaceMigrationRepository.find({
      order: { createdAt: 'ASC', name: 'ASC' },
      where: {
        appliedAt: Not(IsNull()),
        workspaceId,
      },
    });
  }

  /**
   * Get all pending migrations for a given workspaceId
   *
   * @params workspaceId: string
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
   * @params
   * workspaceId: string
   * migration: WorkspaceMigration
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
   * @params
   * name: string
   * workspaceId: string
   * migrations: WorkspaceMigrationTableAction[]
   */
  public async createCustomMigration(
    name: string,
    workspaceId: string,
    migrations: WorkspaceMigrationTableAction[],
  ) {
    return this.workspaceMigrationRepository.save({
      name,
      migrations,
      workspaceId,
      isCustom: true,
    });
  }

  public async deleteAllWithinWorkspace(workspaceId: string) {
    await this.workspaceMigrationRepository.delete({ workspaceId });
  }

  public async deleteById(id: string) {
    await this.workspaceMigrationRepository.delete({ id });
  }
}
