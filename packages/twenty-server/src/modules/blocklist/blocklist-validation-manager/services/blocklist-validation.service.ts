import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import {
  type CreateManyResolverArgs,
  type UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
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
        throw new CommonQueryRunnerException(
          'Blocklist handle is required',
          CommonQueryRunnerExceptionCode.BAD_REQUEST,
          { userFriendlyMessage: msg`Blocklist handle is required.` },
        );
      }

      const result = emailOrDomainSchema.safeParse(handle);

      if (!result.success) {
        throw new CommonQueryRunnerException(
          result.error.issues[0].message,
          CommonQueryRunnerExceptionCode.BAD_REQUEST,
          { userFriendlyMessage: msg`Invalid email or domain.` },
        );
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
        authContext,
      );

    if (
      payload.data.some(
        (item) =>
          isDefined(item.workspaceMemberId) &&
          item.workspaceMemberId !== currentWorkspaceMember.id,
      )
    ) {
      throw new CommonQueryRunnerException(
        'Cannot create blocklist entry for another workspace member',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`Cannot create blocklist entry for another workspace member.`,
        },
      );
    }

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
      throw new CommonQueryRunnerException(
        'Blocklist handle already exists',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        { userFriendlyMessage: msg`Blocklist handle already exists.` },
      );
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
      throw new CommonQueryRunnerException(
        'Blocklist item not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        { userFriendlyMessage: msg`Blocklist item not found.` },
      );
    }

    if (existingRecord.workspaceMemberId !== payload.data.workspaceMemberId) {
      throw new CommonQueryRunnerException(
        'Workspace member cannot be updated',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        { userFriendlyMessage: msg`Workspace member cannot be updated.` },
      );
    }

    if (existingRecord.handle === payload.data.handle) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    const currentWorkspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
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
        authContext,
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
      throw new CommonQueryRunnerException(
        'Blocklist handle already exists',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        { userFriendlyMessage: msg`Blocklist handle already exists.` },
      );
    }
  }
}
