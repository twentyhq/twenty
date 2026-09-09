import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createHash } from 'node:crypto';

import { In, Repository } from 'typeorm';

import { MessageCampaignLinkEntity } from 'src/engine/core-modules/emailing-domain/message-campaign-link.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type CampaignLinkToRegister = { url: string; authoredUrl: string };

@Injectable()
export class MessageCampaignLinkService {
  constructor(
    @InjectWorkspaceScopedRepository(MessageCampaignLinkEntity)
    private readonly messageCampaignLinkRepository: WorkspaceScopedRepository<MessageCampaignLinkEntity>,
    // The redirect endpoint only holds a signed destination id, so the row is
    // looked up before any workspace is known.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(MessageCampaignLinkEntity)
    private readonly globalMessageCampaignLinkRepository: Repository<MessageCampaignLinkEntity>,
  ) {}

  // Rows are immutable and never deleted while the workspace exists: a token
  // in a delivered email must resolve for as long as the email is readable.
  async registerDestinations({
    workspaceId,
    messageCampaignId,
    links,
  }: {
    workspaceId: string;
    messageCampaignId: string;
    links: CampaignLinkToRegister[];
  }): Promise<Map<string, string>> {
    const urlHashes = links.map((link) => this.hashUrl(link.url));

    await this.messageCampaignLinkRepository
      .createQueryBuilder()
      .insert()
      .into(MessageCampaignLinkEntity)
      .values(
        links.map((link, index) => ({
          workspaceId,
          messageCampaignId,
          url: link.url,
          authoredUrl: link.authoredUrl,
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

  async findDestination(
    destinationId: string,
  ): Promise<MessageCampaignLinkEntity | null> {
    return this.globalMessageCampaignLinkRepository.findOne({
      where: { id: destinationId },
    });
  }

  async findCampaignLinks({
    workspaceId,
    messageCampaignId,
  }: {
    workspaceId: string;
    messageCampaignId: string;
  }): Promise<MessageCampaignLinkEntity[]> {
    return this.messageCampaignLinkRepository.find(workspaceId, {
      where: { messageCampaignId },
    });
  }

  private hashUrl(url: string): string {
    return createHash('sha256').update(url).digest('hex');
  }
}
