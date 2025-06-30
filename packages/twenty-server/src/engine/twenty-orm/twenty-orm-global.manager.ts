import { Injectable, Type } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class TwentyORMGlobalManager {
  constructor(
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    workspaceEntity: Type<T>,
    options?: {
      shouldBypassPermissionChecks?: boolean;
      roleId?: string;
    },
  ): Promise<WorkspaceRepository<T>>;

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    objectMetadataName: string,
    options?: {
      shouldBypassPermissionChecks?: boolean;
      roleId?: string;
    },
  ): Promise<WorkspaceRepository<T>>;

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    workspaceEntityOrObjectMetadataName: Type<T> | string,
    options: {
      shouldBypassPermissionChecks?: boolean;
      roleId?: string;
    } = {
      shouldBypassPermissionChecks: false,
    },
  ): Promise<WorkspaceRepository<T>> {
    let objectMetadataName: string;

    if (typeof workspaceEntityOrObjectMetadataName === 'string') {
      objectMetadataName = workspaceEntityOrObjectMetadataName;
    } else {
      objectMetadataName = convertClassNameToObjectMetadataName(
        workspaceEntityOrObjectMetadataName.name,
      );
    }

    const workspaceDataSource =
      await this.workspaceDataSourceFactory.create(workspaceId);

    const repository = workspaceDataSource.getRepository<T>(
      objectMetadataName,
      options.shouldBypassPermissionChecks,
      options.roleId,
    );

    return repository;
  }

  async getDataSourceForWorkspace({ workspaceId }: { workspaceId: string }) {
    return await this.workspaceDataSourceFactory.create(workspaceId);
  }

  async destroyDataSourceForWorkspace(workspaceId: string) {
    await this.workspaceDataSourceFactory.destroy(workspaceId);
  }
}
