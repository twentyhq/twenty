import { Injectable, type Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral, Repository } from 'typeorm';

import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class TwentyORMManager {
  constructor(
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async getRepository<T extends ObjectLiteral>(
    workspaceEntity: Type<T>,
  ): Promise<WorkspaceRepository<T>>;

  async getRepository<T extends ObjectLiteral>(
    objectMetadataName: string,
  ): Promise<WorkspaceRepository<T>>;

  async getRepository<T extends ObjectLiteral>(
    workspaceEntityOrObjectMetadataName: Type<T> | string,
  ): Promise<WorkspaceRepository<T>> {
    const { workspaceId, userWorkspaceId, apiKeyId } =
      this.scopedWorkspaceContextFactory.create();

    let objectMetadataName: string;

    if (typeof workspaceEntityOrObjectMetadataName === 'string') {
      objectMetadataName = workspaceEntityOrObjectMetadataName;
    } else {
      objectMetadataName = convertClassNameToObjectMetadataName(
        workspaceEntityOrObjectMetadataName.name,
      );
    }

    if (!workspaceId) {
      throw new Error('Workspace not found');
    }

    const workspaceDataSource =
      await this.workspaceDataSourceFactory.create(workspaceId);

    let roleId: string | undefined;

    if (isDefined(userWorkspaceId)) {
      const roleTarget = await this.roleTargetRepository.findOne({
        where: {
          userWorkspaceId,
          workspaceId,
        },
      });

      roleId = roleTarget?.roleId;
    } else if (isDefined(apiKeyId)) {
      const roleTarget = await this.roleTargetRepository.findOne({
        where: {
          apiKeyId,
          workspaceId,
        },
      });

      roleId = roleTarget?.roleId;
    }

    return workspaceDataSource.getRepository<T>(
      objectMetadataName,
      roleId ? { unionOf: [roleId] } : undefined,
    );
  }

  async getDatasource() {
    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new Error('Workspace not found');
    }

    return this.workspaceDataSourceFactory.create(workspaceId);
  }
}
