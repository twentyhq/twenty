import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { compareVersionMajorAndMinor } from 'src/utils/version/compare-version-minor-and-major';

@Injectable()
export class WorkspaceVersionService {
  private readonly logger = new Logger(WorkspaceVersionService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async hasActiveOrSuspendedWorkspaces(): Promise<boolean> {
    return this.workspaceRepository.exists({
      where: {
        activationStatus: In([
          WorkspaceActivationStatus.ACTIVE,
          WorkspaceActivationStatus.SUSPENDED,
        ]),
      },
    });
  }

  async getWorkspacesBelowVersion(
    version: string,
  ): Promise<Pick<WorkspaceEntity, 'id' | 'displayName' | 'version'>[]> {
    const allActiveOrSuspendedWorkspaces =
      await this.loadActiveOrSuspendedWorkspaces();

    if (allActiveOrSuspendedWorkspaces.length === 0) {
      this.logger.log(
        'No workspaces found. Running migrations for fresh installation.',
      );

      return [];
    }

    return allActiveOrSuspendedWorkspaces.filter((workspace) => {
      if (!isDefined(workspace.version)) {
        return true;
      }

      try {
        const versionCompareResult = compareVersionMajorAndMinor(
          workspace.version,
          version,
        );

        return versionCompareResult === 'lower';
      } catch (error) {
        this.logger.error(
          `Error checking workspace ${workspace.id} version: ${error.message}`,
        );

        return true;
      }
    });
  }

  private async loadActiveOrSuspendedWorkspaces(): Promise<
    Pick<WorkspaceEntity, 'id' | 'version' | 'displayName'>[]
  > {
    return this.workspaceRepository.find({
      select: ['id', 'version', 'displayName'],
      where: {
        activationStatus: In([
          WorkspaceActivationStatus.ACTIVE,
          WorkspaceActivationStatus.SUSPENDED,
        ]),
      },
      order: {
        id: 'ASC',
      },
    });
  }
}
