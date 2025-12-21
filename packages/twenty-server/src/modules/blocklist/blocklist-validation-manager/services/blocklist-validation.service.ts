import { BadRequestException, Injectable } from '@nestjs/common';

import { z } from 'zod';

import {
  type CreateManyResolverArgs,
  type UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { isDomain } from 'src/engine/utils/is-domain';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type BlocklistItem = Omit<
  BlocklistWorkspaceEntity,
  'createdAt' | 'updatedAt' | 'workspaceMember'
> & {
  createdAt: string;
  updatedAt: string;
  workspaceMemberId: string;
};

@Injectable()
export class BlocklistValidationService {
  constructor(
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  public async validateBlocklistForCreateMany(
    payload: CreateManyResolverArgs<BlocklistItem>,
    userId: string,
    workspaceId: string,
  ) {
    await this.validateSchema(payload.data);
    await this.validateUniquenessForCreateMany(payload, userId, workspaceId);
  }

  public async validateBlocklistForUpdateOne(
    payload: UpdateOneResolverArgs<BlocklistItem>,
    userId: string,
    workspaceId: string,
  ) {
    if (payload.data.handle) {
      await this.validateSchema([payload.data]);
    }
    await this.validateUniquenessForUpdateOne(payload, userId, workspaceId);
  }

  public async validateSchema(blocklist: BlocklistItem[]) {
    const emailOrDomainSchema = z
      .string()
      .trim()
      .pipe(z.email({ error: 'Invalid email or domain' }))
      .or(
        z
          .string()
          .refine(
            (value) => value.startsWith('@') && isDomain(value.slice(1)),
            'Invalid email or domain',
          ),
      );

    for (const handle of blocklist.map((item) => item.handle)) {
      if (!handle) {
        throw new BadRequestException('Blocklist handle is required');
      }

      const result = emailOrDomainSchema.safeParse(handle);

      if (!result.success) {
        throw new BadRequestException(result.error.issues[0].message);
      }
    }
  }

  public async validateUniquenessForCreateMany(
    payload: CreateManyResolverArgs<BlocklistItem>,
    userId: string,
    workspaceId: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    const currentWorkspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              WorkspaceMemberWorkspaceEntity,
            );

          return workspaceMemberRepository.findOneByOrFail({
            userId,
          });
        },
      );

    const currentBlocklist =
      await this.blocklistRepository.getByWorkspaceMemberId(
        currentWorkspaceMember.id,
        workspaceId,
      );

    const currentBlocklistHandles = currentBlocklist.map(
      (blocklist) => blocklist.handle,
    );

    if (
      payload.data.some((item) => currentBlocklistHandles.includes(item.handle))
    ) {
      throw new BadRequestException('Blocklist handle already exists');
    }
  }

  public async validateUniquenessForUpdateOne(
    payload: UpdateOneResolverArgs<BlocklistItem>,
    userId: string,
    workspaceId: string,
  ) {
    const existingRecord = await this.blocklistRepository.getById(
      payload.id,
      workspaceId,
    );

    if (!existingRecord) {
      throw new BadRequestException('Blocklist item not found');
    }

    if (existingRecord.workspaceMemberId !== payload.data.workspaceMemberId) {
      throw new BadRequestException('Workspace member cannot be updated');
    }

    if (existingRecord.handle === payload.data.handle) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    const currentWorkspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              WorkspaceMemberWorkspaceEntity,
            );

          return workspaceMemberRepository.findOneByOrFail({
            userId,
          });
        },
      );

    const currentBlocklist =
      await this.blocklistRepository.getByWorkspaceMemberId(
        currentWorkspaceMember.id,
        workspaceId,
      );

    const currentBlocklistHandles = currentBlocklist
      .filter((blocklist) => blocklist.id !== payload.id)
      .map((blocklist) => blocklist.handle);

    if (currentBlocklistHandles.includes(payload.data.handle)) {
      throw new BadRequestException('Blocklist handle already exists');
    }
  }
}
