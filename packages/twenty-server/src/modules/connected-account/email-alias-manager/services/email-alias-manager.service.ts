import { Injectable, Logger } from '@nestjs/common';

import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
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

  public async refreshEmailAliases(
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
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
