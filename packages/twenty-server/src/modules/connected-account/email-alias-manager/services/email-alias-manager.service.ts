import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { GoogleEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/google-email-alias-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class EmailAliasManagerService {
  constructor(
    private readonly googleEmailAliasManagerService: GoogleEmailAliasManagerService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async refreshHandleAliases(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ) {
    let handleAliases: string[];

    switch (connectedAccount.provider) {
      case 'microsoft':
        return;
      case 'google':
        handleAliases =
          await this.googleEmailAliasManagerService.getHandleAliases(
            connectedAccount,
          );
        break;
      default:
        throw new Error(
          `Email alias manager for provider ${connectedAccount.provider} is not implemented`,
        );
    }

    const connectedAccountRepository =
      await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
        'connectedAccount',
      );

    await connectedAccountRepository.update(
      { id: connectedAccount.id },
      {
        handleAliases: handleAliases.join(','), // TODO: modify handleAliases to be of fieldmetadatatype array
      },
    );
  }
}
