import { Injectable, Logger } from '@nestjs/common';

import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { GoogleEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/google-email-alias-manager.service';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class EmailAliasManagerService {
  private readonly logger = new Logger(EmailAliasManagerService.name);

  constructor(
    @InjectWorkspaceRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly googleEmailAliasManagerService: GoogleEmailAliasManagerService,
  ) {}

  public async refreshAliases(connectedAccountId: string, workspaceId: string) {
    this.logger.log(
      `Refreshing email aliases for connected account ${connectedAccountId} in workspace ${workspaceId}`,
    );

    const connectedAccount =
      await this.connectedAccountRepository.getByIdOrFail(
        connectedAccountId,
        workspaceId,
      );

    switch (connectedAccount.provider) {
      case 'google':
        await this.googleEmailAliasManagerService.refreshAliases(
          connectedAccountId,
          workspaceId,
        );
        break;
      default:
        throw new Error(
          `Email alias manager for provider ${connectedAccount.provider} is not implemented`,
        );
    }
  }
}
