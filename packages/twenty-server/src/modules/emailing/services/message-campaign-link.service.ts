import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createHash } from 'node:crypto';

import { In, Repository } from 'typeorm';

import { MessageCampaignLinkClickEntity } from 'src/engine/core-modules/emailing-domain/message-campaign-link-click.entity';
import { MessageCampaignLinkEntity } from 'src/engine/core-modules/emailing-domain/message-campaign-link.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type ResolveLinkIdsArgs = {
  workspaceId: string;
  messageCampaignId: string;
  urls: string[];
};

type RecordClickArgs = {
  workspaceId: string;
  messageCampaignLinkId: string;
  messageId: string;
};

@Injectable()
export class MessageCampaignLinkService {
  constructor(
    @InjectWorkspaceScopedRepository(MessageCampaignLinkEntity)
    private readonly messageCampaignLinkRepository: WorkspaceScopedRepository<MessageCampaignLinkEntity>,
    @InjectWorkspaceScopedRepository(MessageCampaignLinkClickEntity)
    private readonly messageCampaignLinkClickRepository: WorkspaceScopedRepository<MessageCampaignLinkClickEntity>,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(MessageCampaignLinkEntity)
    private readonly globalMessageCampaignLinkRepository: Repository<MessageCampaignLinkEntity>,
  ) {}

  async resolveLinkIdsByUrl({
    workspaceId,
    messageCampaignId,
    urls,
  }: ResolveLinkIdsArgs): Promise<Map<string, string>> {
    const urlHashes = urls.map((url) => this.hashUrl(url));

    await this.messageCampaignLinkRepository
      .createQueryBuilder()
      .insert()
      .into(MessageCampaignLinkEntity)
      .values(
        urls.map((url, index) => ({
          workspaceId,
          messageCampaignId,
          url,
          urlHash: urlHashes[index],
        })),
      )
      .orIgnore()
      .execute();

    const persistedLinks = await this.messageCampaignLinkRepository.find(
      workspaceId,
      { where: { messageCampaignId, urlHash: In(urlHashes) } },
    );

    return new Map(persistedLinks.map((link) => [link.url, link.id]));
  }

  async recordClick({
    workspaceId,
    messageCampaignLinkId,
    messageId,
  }: RecordClickArgs): Promise<void> {
    await this.messageCampaignLinkClickRepository
      .createQueryBuilder()
      .insert()
      .into(MessageCampaignLinkClickEntity)
      .values({
        workspaceId,
        messageCampaignLinkId,
        messageId,
        clickCount: 1,
        lastClickedAt: new Date(),
      })
      .onConflict(
        `("messageCampaignLinkId", "messageId") DO UPDATE SET "clickCount" = "messageCampaignLinkClick"."clickCount" + 1, "lastClickedAt" = EXCLUDED."lastClickedAt"`,
      )
      .execute();
  }

  async findLinkById(
    messageCampaignLinkId: string,
  ): Promise<MessageCampaignLinkEntity | null> {
    return this.globalMessageCampaignLinkRepository.findOne({
      where: { id: messageCampaignLinkId },
    });
  }

  private hashUrl(url: string): string {
    return createHash('sha256').update(url).digest('hex');
  }
}
