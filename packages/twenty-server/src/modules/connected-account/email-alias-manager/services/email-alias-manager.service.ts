import { Injectable } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GoogleEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/google-email-alias-manager.service';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class EmailAliasManagerService {
  constructor(
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly googleEmailAliasManagerService: GoogleEmailAliasManagerService,
  ) {}

  public async refreshHandleAliases(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ) {
    let handleAliases: string[];

    switch (connectedAccount.provider) {
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

    await this.connectedAccountRepository.updateHandleAliases(
      handleAliases,
      connectedAccount.id,
      workspaceId,
    );
  }
}
