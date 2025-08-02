import { Injectable, Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { ObjectLiteral, Repository } from 'typeorm';

import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class TwentyORMManager {
  constructor(
    @InjectRepository(RoleTargetsEntity, 'core')
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
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
      const roleTarget = await this.roleTargetsRepository.findOne({
        where: {
          userWorkspaceId,
          workspaceId,
        },
      });

      roleId = roleTarget?.roleId;
    } else if (isDefined(apiKeyId)) {
      const roleTarget = await this.roleTargetsRepository.findOne({
        where: {
          apiKeyId,
          workspaceId,
        },
      });

      roleId = roleTarget?.roleId;
    }

    return workspaceDataSource.getRepository<T>(
      objectMetadataName,
      false,
      roleId,
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
