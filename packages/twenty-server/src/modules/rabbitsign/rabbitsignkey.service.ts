// packages/twenty-server/src/modules/rabbitsign/rabbitsignkey.service.ts
import { Injectable } from '@nestjs/common';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { RabbitSignKeyWorkspaceEntity } from './standard-objects/rabbitsignkey.workplace-entity';

@Injectable()
export class RabbitSignKeyService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async getRabbitSignKeyForWorkspace(workspaceMemberId: string, workspaceId: string) {
    const rabbitSignKeyRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignKeyWorkspaceEntity>(
        workspaceId,
        'rabbitSignKey',
      );

    const rabbitSignKey = await rabbitSignKeyRepository.findOne({
      where: {
        workspaceMemberId,
      },
    });

    if (!rabbitSignKey) {
      throw new NotFoundError(
        `RabbitSign key not found for workspace member ${workspaceMemberId}`,
      );
    }

    return rabbitSignKey;
  }
}