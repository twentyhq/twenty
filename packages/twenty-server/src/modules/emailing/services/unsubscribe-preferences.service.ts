import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type TopicOptOutState } from 'src/engine/core-modules/emailing-domain/types/topic-opt-out-state.type';
import { type UnsubscribePageSender } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-page-sender.type';
import { type UnsubscribePageTracking } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-page-tracking.type';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';

@Injectable()
export class UnsubscribePreferencesService {
  constructor(
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly fileUrlService: FileUrlService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getPreferencesPageData({
    workspaceId,
    emailAddress,
    isExpired,
  }: {
    workspaceId: string;
    emailAddress: string;
    isExpired: boolean;
  }): Promise<{
    sender: UnsubscribePageSender;
    topics: TopicOptOutState[];
    tracking: UnsubscribePageTracking | undefined;
  }> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    const [sender, topics, tracking] = await Promise.all([
      this.getSender(workspace),
      isExpired
        ? []
        : this.messageSuppressionService.getTopicOptOutState({
            workspaceId,
            emailAddress,
          }),
      isExpired
        ? undefined
        : this.getTracking({ workspace, workspaceId, emailAddress }),
    ]);

    return { sender, topics, tracking };
  }

  private async getSender(
    workspace: Pick<
      WorkspaceEntity,
      'id' | 'displayName' | 'logoFileId'
    > | null,
  ): Promise<UnsubscribePageSender> {
    if (!isDefined(workspace)) {
      return { name: null, logoUrl: null };
    }

    return {
      name: workspace.displayName ?? null,
      logoUrl: await this.fileUrlService.signWorkspaceLogoUrl(workspace),
    };
  }

  private async getTracking({
    workspace,
    workspaceId,
    emailAddress,
  }: {
    workspace: Pick<
      WorkspaceEntity,
      'isCampaignOpenTrackingEnabled' | 'isCampaignClickTrackingEnabled'
    > | null;
    workspaceId: string;
    emailAddress: string;
  }): Promise<UnsubscribePageTracking | undefined> {
    if (!isDefined(workspace)) {
      return undefined;
    }

    return {
      isOptedOut: await this.messageSuppressionService.isTrackingOptedOut({
        workspaceId,
        emailAddress,
      }),
      isOpenTrackingEnabled: workspace.isCampaignOpenTrackingEnabled,
      isClickTrackingEnabled: workspace.isCampaignClickTrackingEnabled,
    };
  }
}
