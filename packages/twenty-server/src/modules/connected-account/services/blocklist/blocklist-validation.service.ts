import { BadRequestException, Injectable } from '@nestjs/common';

import { z } from 'zod';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { isDomain } from 'src/engine/utils/is-domain';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@Injectable()
export class BlocklistValidationService {
  constructor(
    @InjectObjectMetadataRepository(BlocklistObjectMetadata)
    private readonly blocklistRepository: BlocklistRepository,
    @InjectObjectMetadataRepository(WorkspaceMemberObjectMetadata)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
  ) {}

  public async validateBlocklist(
    blocklistHandles: string[],
    userId: string,
    workspaceId: string,
  ) {
    await this.validateBlocklistSchema(blocklistHandles);
    await this.validateBlocklistUniqueness(
      blocklistHandles,
      userId,
      workspaceId,
    );
  }

  public async validateBlocklistSchema(blocklistHandles: string[]) {
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

    for (const handle of blocklistHandles) {
      if (!handle) {
        throw new BadRequestException('Blocklist handle is required');
      }

      emailOrDomainSchema.parse(handle);
    }
  }

  public async validateBlocklistUniqueness(
    blocklistHandles: string[],
    userId: string,
    workspaceId: string,
  ) {
    const currentWorkspaceMember =
      await this.workspaceMemberRepository.getByIdOrFail(userId, workspaceId);

    const currentBlocklist =
      await this.blocklistRepository.getByWorkspaceMemberId(
        currentWorkspaceMember.id,
        workspaceId,
      );

    const currentBlocklistHandles = currentBlocklist.map(
      (blocklist) => blocklist.handle,
    );

    if (
      blocklistHandles.some((handle) =>
        currentBlocklistHandles.includes(handle),
      )
    ) {
      throw new BadRequestException('Blocklist handle already exists');
    }
  }
}
