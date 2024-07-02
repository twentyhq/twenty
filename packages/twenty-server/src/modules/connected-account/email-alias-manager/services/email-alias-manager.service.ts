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

  public async refreshEmailAliases(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ) {
    let emailAliases: string[];

    switch (connectedAccount.provider) {
      case 'google':
        emailAliases =
          await this.googleEmailAliasManagerService.getEmailAliases(
            connectedAccount,
          );
        break;
      default:
        throw new Error(
          `Email alias manager for provider ${connectedAccount.provider} is not implemented`,
        );
    }

    await this.connectedAccountRepository.updateEmailAliases(
      emailAliases,
      connectedAccount.id,
      workspaceId,
    );
  }
}
