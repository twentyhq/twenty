import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

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

  async getSender(workspaceId: string): Promise<UnsubscribePageSender> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isDefined(workspace)) {
      return { name: null, logoUrl: null };
    }

    return {
      name: workspace.displayName ?? null,
      logoUrl: await this.fileUrlService.signWorkspaceLogoUrl(workspace),
    };
  }

  async getTracking({
    workspaceId,
    emailAddress,
  }: {
    workspaceId: string;
    emailAddress: string;
  }): Promise<UnsubscribePageTracking | undefined> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (
      !isDefined(workspace) ||
      (!workspace.isCampaignOpenTrackingEnabled &&
        !workspace.isCampaignClickTrackingEnabled)
    ) {
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
