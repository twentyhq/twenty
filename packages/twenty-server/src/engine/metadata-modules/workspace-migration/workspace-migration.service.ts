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
   * @returns Promise<WorkspaceMigration[]>
   * @param workspaceId
   */
  public async getPendingMigrations(
    workspaceId: string,
  ): Promise<WorkspaceMigrationEntity[]> {
    const pendingMigrations = await this.workspaceMigrationRepository.find({
      order: { createdAt: 'ASC', name: 'ASC' },
      where: {
        appliedAt: IsNull(),
        workspaceId,
      },
    });

    const typeOrder = { delete: 1, update: 2, create: 3 };

    const getType = (name: string) =>
      name.split('-')[1] as keyof typeof typeOrder;

    return pendingMigrations.sort((a, b) => {
      if (a.createdAt.getTime() !== b.createdAt.getTime()) {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }

      return (
        (typeOrder[getType(a.name)] || 4) - (typeOrder[getType(b.name)] || 4) ||
        a.name.localeCompare(b.name)
      );
    });
  }

  /**
   * Find workspaces with pending migrations
   *
   * @returns Promise<{ workspaceId: string; pendingMigrations: number }[]>
   */
  public async getWorkspacesWithPendingMigrations(limit: number) {
    const results = await this.workspaceMigrationRepository
      .createQueryBuilder('workspaceMigration')
      .select('workspaceMigration.workspaceId', 'workspaceId')
      .addSelect('COUNT(*)', 'pendingCount')
      .where('workspaceMigration.appliedAt IS NULL')
      .groupBy('workspaceMigration.workspaceId')
      .limit(limit)
      .getRawMany();

    return results.map((result) => ({
      workspaceId: result.workspaceId,
      pendingMigrations: Number(result.pendingCount) || 0,
    }));
  }

  /**
   * Count total number of workspaces with pending migrations
   *
   * @returns Promise<number>
   */
  public async countWorkspacesWithPendingMigrations(): Promise<number> {
    const result = await this.workspaceMigrationRepository
      .createQueryBuilder('workspaceMigration')
      .select('COUNT(DISTINCT workspaceMigration.workspaceId)', 'count')
      .where('workspaceMigration.appliedAt IS NULL')
      .getRawOne();

    return Number(result.count) || 0;
  }

  /**
   * Set appliedAt as current date for a given migration.
   * Should be called once the migration has been applied
   *
   * @param workspaceId
   * @param migration
   */
  public async setAppliedAtForMigration(
    workspaceId: string,
    migration: WorkspaceMigrationEntity,
  ) {
    await this.workspaceMigrationRepository.update(
      { id: migration.id, workspaceId },
      { appliedAt: new Date() },
    );
  }

  /**
   * Create a new pending migration for a given workspaceId and expected changes
   *
   * @param name
   * @param workspaceId
   * @param migrations
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
