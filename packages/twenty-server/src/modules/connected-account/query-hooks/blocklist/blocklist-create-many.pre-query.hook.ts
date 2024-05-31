import { Injectable } from '@nestjs/common';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  BlocklistItem,
  BlocklistValidationService,
} from 'src/modules/connected-account/services/blocklist/blocklist-validation.service';

@Injectable()
export class BlocklistCreateManyPreQueryHook implements WorkspacePreQueryHook {
  constructor(
    private readonly blocklistValidationService: BlocklistValidationService,
  ) {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: CreateManyResolverArgs<BlocklistItem>,
  ): Promise<void> {
    await this.blocklistValidationService.validateBlocklistForCreateMany(
      payload,
      userId,
      workspaceId,
    );
  }
}
