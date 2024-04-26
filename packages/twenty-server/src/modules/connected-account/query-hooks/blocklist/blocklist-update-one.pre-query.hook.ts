import { Injectable } from '@nestjs/common';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { BlocklistValidationService } from 'src/modules/connected-account/services/blocklist/blocklist-validation.service';

@Injectable()
export class BlocklistUpdateOnePreQueryHook implements WorkspacePreQueryHook {
  constructor(
    private readonly blocklistValidationService: BlocklistValidationService,
  ) {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: UpdateOneResolverArgs<
      Omit<BlocklistObjectMetadata, 'createdAt' | 'updatedAt'> & {
        createdAt: string;
        updatedAt: string;
      }
    >,
  ): Promise<void> {
    await this.blocklistValidationService.validateBlocklistForUpdateOne(
      payload,
      userId,
      workspaceId,
    );
  }
}
