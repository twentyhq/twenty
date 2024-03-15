import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/modules/workspace/workspace.entity';
import { UserWorkspace } from 'src/engine/modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/modules/user/user.entity';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { UserWorkspaceService } from 'src/engine/modules/user-workspace/user-workspace.service';
import { BillingService } from 'src/engine/modules/billing/billing.service';
import { DataSourceService } from 'src/engine-metadata/data-source/data-source.service';
import { ActivateWorkspaceInput } from 'src/engine/modules/workspace/dtos/activate-workspace-input';

export class WorkspaceService extends TypeOrmQueryService<Workspace> {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly workspaceManagerService: WorkspaceManagerService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly billingService: BillingService,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
  ) {
    super(workspaceRepository);
  }

  async activateWorkspace(user: User, data: ActivateWorkspaceInput) {
    if (!data.displayName || !data.displayName.length) {
      throw new BadRequestException("'displayName' not provided");
    }
    await this.workspaceRepository.update(user.defaultWorkspace.id, {
      displayName: data.displayName,
    });
    await this.workspaceManagerService.init(user.defaultWorkspace.id);
    await this.userWorkspaceService.createWorkspaceMember(
      user.defaultWorkspace.id,
      user,
    );

    return user.defaultWorkspace;
  }

  async isWorkspaceActivated(id: string): Promise<boolean> {
    return await this.workspaceManagerService.doesDataSourceExist(id);
  }

  async deleteWorkspace(id: string, shouldDeleteCoreWorkspace = true) {
    const workspace = await this.workspaceRepository.findOneBy({ id });

    assert(workspace, 'Workspace not found');

    await this.userWorkspaceRepository.delete({ workspaceId: id });
    await this.billingService.deleteSubscription(workspace.id);

    await this.workspaceManagerService.delete(id);
    if (shouldDeleteCoreWorkspace) {
      await this.workspaceRepository.delete(id);
    }

    return workspace;
  }

  async getWorkspaceIds() {
    return this.workspaceRepository
      .find()
      .then((workspaces) => workspaces.map((workspace) => workspace.id));
  }

  async removeWorkspaceMember(workspaceId: string, memberId: string) {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const [workspaceMember] = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "id" = '${memberId}'`,
    );

    if (!workspaceMember) {
      throw new NotFoundException('Member not found.');
    }

    await workspaceDataSource?.query(
      `DELETE FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "id" = '${memberId}'`,
    );

    if (workspaceMember.userId) {
      const workspaceMemberUser = await this.userRepository.findOne({
        where: {
          id: workspaceMember.userId,
        },
        relations: ['defaultWorkspace'],
      });

      assert(workspaceMemberUser, 'User not found');

      const userWorkspaces = await this.userWorkspaceRepository.find({
        where: { userId: workspaceMemberUser.id },
        relations: ['workspace'],
      });

      if (userWorkspaces.length > 1) {
        if (workspaceMemberUser.defaultWorkspace.id === workspaceId) {
          const filteredUserWorkspaces = userWorkspaces.filter(
            (workspace) => workspace.workspaceId !== workspaceId,
          );

          const nextWorkspace = await this.workspaceRepository.findOneBy({
            id: filteredUserWorkspaces[0].workspaceId,
          });

          assert(nextWorkspace, 'Cannot assign new workspace to user.');

          if (nextWorkspace) {
            await this.userRepository.save({
              id: workspaceMemberUser.id,
              defaultWorkspace: nextWorkspace,
              updatedAt: new Date().toISOString(),
            });
          }
        }
        await this.userWorkspaceRepository.delete({
          userId: workspaceMemberUser.id,
          workspaceId,
        });
      } else {
        await this.userWorkspaceRepository.delete({
          userId: workspaceMemberUser.id,
        });
        await this.userRepository.delete({ id: workspaceMemberUser.id });
      }
    }

    return memberId;
  }
}
