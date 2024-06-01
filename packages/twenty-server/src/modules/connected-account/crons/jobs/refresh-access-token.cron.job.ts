import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

const MIN_TOKEN_REFRESHED_MINUTES_AGO = 30;

@Injectable()
export class RefreshAccessTokenCronJob implements MessageQueueJob<undefined> {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
  ) {}

  async handle(): Promise<void> {
    const workspaceIds = (
      await this.workspaceRepository.find({
        select: ['id'],
      })
    ).map((workspace) => workspace.id);

    const accountsToRefreshPerWorkspace = await Promise.all(
      workspaceIds.map(async (workspaceId) => ({
        workspaceId,
        accounts:
          await this.connectedAccountRepository.getAllThatNeedToRefereshAccessToken(
            workspaceId,
            MIN_TOKEN_REFRESHED_MINUTES_AGO,
          ),
      })),
    );

    for (const { workspaceId, accounts } of accountsToRefreshPerWorkspace) {
      await Promise.all(
        accounts.map((account) =>
          this.refreshAccessToken(workspaceId, account),
        ),
      );
    }
  }

  private async refreshAccessToken(
    workspaceId: string,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
  ) {
    if (connectedAccount.provider !== 'google') {
      return;
    }

    await this.googleAPIsRefreshAccessTokenService.refreshAndSaveAccessToken(
      workspaceId,
      connectedAccount.id,
    );
  }
}
