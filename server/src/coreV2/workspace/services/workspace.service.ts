import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { Workspace } from 'src/coreV2/workspace/workspace.entity';
import { TenantManagerService } from 'src/tenant-manager/tenant-manager.service';

export class WorkspaceService extends TypeOrmQueryService<Workspace> {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly tenantManagerService: TenantManagerService,
  ) {
    super(workspaceRepository);
  }

  async deleteWorkspace(id: string) {
    const workspace = await this.workspaceRepository.findOneBy({ id });
    assert(workspace, 'Workspace not found');

    // await this.deleteWorkspaceRelations(id);

    await this.tenantManagerService.delete(id);

    return workspace;
  }

  // // FIXME: The rest of the entities are not defined so we can't use this
  // async deleteWorkspaceRelations(workspaceId: string) {
  //   const queryRunner =
  //     this.workspaceRepository.manager.connection.createQueryRunner();
  //   await queryRunner.connect();

  //   await queryRunner.startTransaction();

  //   try {
  //     await queryRunner.manager.delete(PipelineProgress, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(Company, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(Person, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(PipelineStage, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(WorkspaceMember, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(Attachment, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(Comment, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(ActivityTarget, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(Activity, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(ApiKey, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(Favorite, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(WebHook, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(WebHook, {
  //       workspaceId,
  //     });

  //     await queryRunner.manager.delete(Workspace, {
  //       id: workspaceId,
  //     });

  //     await queryRunner.commitTransaction();
  //   } catch {
  //     await queryRunner.rollbackTransaction();
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
