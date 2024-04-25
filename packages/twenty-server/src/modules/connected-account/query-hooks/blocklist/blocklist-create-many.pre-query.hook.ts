import { Injectable } from '@nestjs/common';

import z from 'zod';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { isDomain } from 'src/engine/utils/is-domain';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@Injectable()
export class BlocklistCreateManyPreQueryHook implements WorkspacePreQueryHook {
  constructor(
    @InjectObjectMetadataRepository(BlocklistObjectMetadata)
    private readonly blocklistRepository: BlocklistRepository,
    @InjectObjectMetadataRepository(WorkspaceMemberObjectMetadata)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
  ) {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: CreateManyResolverArgs<
      Omit<BlocklistObjectMetadata, 'createdAt' | 'updatedAt'> & {
        createdAt: string;
        updatedAt: string;
      }
    >,
  ): Promise<void> {
    const emailOrDomainSchema = z
      .string()
      .trim()
      .email('Invalid email or domain')
      .or(
        z
          .string()
          .refine(
            (value) => value.startsWith('@') && isDomain(value.slice(1)),
            'Invalid email or domain',
          ),
      );

    const currentWorkspaceMember =
      await this.workspaceMemberRepository.getByIdOrFail(userId, workspaceId);

    for (const { handle } of payload.data) {
      if (!handle) {
        throw new Error('Handle is required');
      }

      emailOrDomainSchema.parse(handle);

      const blocklist =
        await this.blocklistRepository.getByWorkspaceMemberIdAndHandle(
          currentWorkspaceMember.id,
          handle,
          workspaceId,
        );

      if (blocklist.length > 0) {
        throw new Error('Email or domain is already in blocklist');
      }
    }
  }
}
