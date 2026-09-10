import { Injectable } from '@nestjs/common';

import { BlocklistScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, In } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';

@Injectable()
export class BlocklistRepository {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  public async getById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<BlocklistWorkspaceEntity | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const blockListRepository = this.workspaceOrmManager.getRepository(
        BlocklistWorkspaceEntity,
        {
          shouldBypassPermissionChecks: true,
        },
      );

      return blockListRepository.findOne({
        where: { id },
        withDeleted: true,
      });
    }, authContext);
  }

  public async getByIds({
    ids,
    workspaceId,
  }: {
    ids: string[];
    workspaceId: string;
  }): Promise<BlocklistWorkspaceEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const blockListRepository = this.workspaceOrmManager.getRepository(
        BlocklistWorkspaceEntity,
        {
          shouldBypassPermissionChecks: true,
        },
      );

      return blockListRepository.find({
        where: { id: In(ids) },
        withDeleted: true,
      });
    }, authContext);
  }

  public async getMemberScopedEntries({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<BlocklistWorkspaceEntity[]> {
    return this.find({
      workspaceId,
      where: {
        scope: BlocklistScope.WORKSPACE_MEMBER,
        workspaceMemberId,
      },
    });
  }

  public async getWorkspaceScopedEntries(
    workspaceId: string,
  ): Promise<BlocklistWorkspaceEntity[]> {
    return this.find({
      workspaceId,
      where: { scope: BlocklistScope.WORKSPACE },
    });
  }

  public async getEntriesApplicableToWorkspaceMember({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string | null;
    workspaceId: string;
  }): Promise<BlocklistWorkspaceEntity[]> {
    if (!isDefined(workspaceMemberId)) {
      return this.getWorkspaceScopedEntries(workspaceId);
    }

    return this.find({
      workspaceId,
      where: [
        { scope: BlocklistScope.WORKSPACE },
        { scope: BlocklistScope.WORKSPACE_MEMBER, workspaceMemberId },
      ],
    });
  }

  private async find({
    workspaceId,
    where,
  }: {
    workspaceId: string;
    where:
      | FindOptionsWhere<BlocklistWorkspaceEntity>
      | FindOptionsWhere<BlocklistWorkspaceEntity>[];
  }): Promise<BlocklistWorkspaceEntity[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const blockListRepository = this.workspaceOrmManager.getRepository(
        BlocklistWorkspaceEntity,
      );

      return blockListRepository.find({ where });
    }, authContext);
  }
}
