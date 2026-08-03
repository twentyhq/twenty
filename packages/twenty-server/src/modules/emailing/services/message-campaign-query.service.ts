import { Injectable, NotFoundException, type Type } from '@nestjs/common';

import { In, type ObjectLiteral } from 'typeorm';
import {
  MessageCampaignStatus,
  MessageParticipantRole,
} from 'twenty-shared/types';

import { MessageCampaignDetailsDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-details.dto';
import { MessageCampaignSummaryDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-summary.dto';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { renderCampaignTemplate } from 'src/modules/emailing/utils/render-campaign-template.util';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class MessageCampaignQueryService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  private getSystemRepository<T extends ObjectLiteral>(
    workspaceId: string,
    entity: Type<T>,
  ) {
    return this.globalWorkspaceOrmManager.getRepository(workspaceId, entity, {
      shouldBypassPermissionChecks: true,
    });
  }

  async findAll(workspaceId: string): Promise<MessageCampaignSummaryDTO[]> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const campaignRepository = await this.getSystemRepository(
          workspaceId,
          MessageCampaignWorkspaceEntity,
        );
        const campaigns = await campaignRepository.find({
          order: { updatedAt: 'DESC' },
          relations: { list: true },
          take: 500,
        });

        const campaignIds = campaigns.map(({ id }) => id);
        const listIds = campaigns
          .map(({ listId }) => listId)
          .filter((listId): listId is string => listId !== null);
        const [messages, listMembers] = await Promise.all([
          campaignIds.length === 0
            ? []
            : this.getSystemRepository(
                workspaceId,
                MessageWorkspaceEntity,
              ).then((repository) =>
                repository.find({
                  select: ['id', 'messageCampaignId'],
                  where: { messageCampaignId: In(campaignIds) },
                }),
              ),
          listIds.length === 0
            ? []
            : this.getSystemRepository(
                workspaceId,
                MessageListMemberWorkspaceEntity,
              ).then((repository) =>
                repository.find({
                  select: ['id', 'listId'],
                  where: { listId: In(listIds) },
                }),
              ),
        ]);
        const recipientCounts = this.countBy(
          messages.map(({ messageCampaignId }) => messageCampaignId),
        );
        const draftAudienceCounts = this.countBy(
          listMembers.map(({ listId }) => listId),
        );

        return campaigns.map((campaign) =>
          this.toSummary(
            campaign,
            campaign.status === MessageCampaignStatus.DRAFT
              ? (draftAudienceCounts.get(campaign.listId ?? '') ?? 0)
              : (recipientCounts.get(campaign.id) ?? 0),
          ),
        );
      },
    );
  }

  async findOne({
    workspaceId,
    campaignId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    campaignId: string;
    workspaceMemberId: string;
  }): Promise<MessageCampaignDetailsDTO> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const campaignRepository = await this.getSystemRepository(
          workspaceId,
          MessageCampaignWorkspaceEntity,
        );
        const campaign = await campaignRepository.findOne({
          where: { id: campaignId },
          relations: { list: true },
        });

        if (campaign === null) {
          throw new NotFoundException('Campaign not found');
        }

        const participantRepository = await this.getSystemRepository(
          workspaceId,
          MessageParticipantWorkspaceEntity,
        );
        const participants = await participantRepository.find({
          where: {
            messageCampaignId: campaignId,
            role: MessageParticipantRole.TO,
          },
          order: { createdAt: 'ASC' },
        });
        const messageIds = participants.map(({ messageId }) => messageId);
        const personIds = participants
          .map(({ personId }) => personId)
          .filter((personId): personId is string => personId !== null);
        const [messages, people, draftAudience] = await Promise.all([
          messageIds.length === 0
            ? []
            : this.getSystemRepository(
                workspaceId,
                MessageWorkspaceEntity,
              ).then((repository) =>
                repository.find({ where: { id: In(messageIds) } }),
              ),
          personIds.length === 0
            ? []
            : this.getSystemRepository(workspaceId, PersonWorkspaceEntity).then(
                (repository) =>
                  repository.find({ where: { id: In(personIds) } }),
              ),
          campaign.status !== MessageCampaignStatus.DRAFT ||
          campaign.listId === null
            ? []
            : this.getSystemRepository(
                workspaceId,
                MessageListMemberWorkspaceEntity,
              ).then((repository) =>
                repository.find({
                  select: ['personId'],
                  where: { listId: campaign.listId as string },
                }),
              ),
        ]);
        const messagesById = new Map(
          messages.map((message) => [message.id, message]),
        );
        const peopleById = new Map(people.map((person) => [person.id, person]));
        const recipients = participants.map((participant) => {
          const message = messagesById.get(participant.messageId);
          const person = participant.personId
            ? peopleById.get(participant.personId)
            : undefined;
          const personName = [person?.name?.firstName, person?.name?.lastName]
            .filter(Boolean)
            .join(' ');
          const variables = {
            firstName: person?.name?.firstName ?? '',
            lastName: person?.name?.lastName ?? '',
            fullName: personName,
            email: person?.emails?.primaryEmail ?? participant.handle ?? '',
          };

          return {
            messageId: participant.messageId,
            personId: participant.personId,
            displayName:
              personName ||
              participant.displayName ||
              participant.handle ||
              'Unknown recipient',
            email: participant.handle ?? '',
            deliveryStatus: message?.deliveryStatus ?? 'QUEUED',
            subject: renderCampaignTemplate(campaign.subject ?? '', variables, {
              escapeValues: false,
            }),
            body: renderCampaignTemplate(
              campaign.bodyTemplate ?? '',
              variables,
              { escapeValues: true },
            ),
          };
        });
        const recipientCount =
          campaign.status === MessageCampaignStatus.DRAFT
            ? draftAudience.length
            : recipients.length;

        return {
          ...this.toSummary(campaign, recipientCount),
          body: campaign.bodyTemplate,
          unsubscribeTopicId: campaign.unsubscribeTopicId,
          canEdit:
            campaign.status === MessageCampaignStatus.DRAFT &&
            campaign.createdBy.workspaceMemberId === workspaceMemberId,
          recipients,
          draftPersonIds: draftAudience.map(({ personId }) => personId),
        };
      },
    );
  }

  private toSummary(
    campaign: MessageCampaignWorkspaceEntity,
    recipientCount: number,
  ): MessageCampaignSummaryDTO {
    return {
      id: campaign.id,
      subject: campaign.subject,
      status: campaign.status,
      fromAddress: campaign.fromAddress?.primaryEmail ?? null,
      listId: campaign.listId,
      listName: campaign.list?.name ?? null,
      creatorWorkspaceMemberId: campaign.createdBy.workspaceMemberId ?? null,
      creatorName: campaign.createdBy.name || 'Unknown user',
      createdAt: new Date(campaign.createdAt),
      updatedAt: new Date(campaign.updatedAt),
      sentAt: campaign.sentAt === null ? null : new Date(campaign.sentAt),
      recipientCount,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      bouncedCount: campaign.bouncedCount,
      complainedCount: campaign.complainedCount,
    };
  }

  private countBy(values: Array<string | null>): Map<string, number> {
    return values.reduce((counts, value) => {
      if (value !== null) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }

      return counts;
    }, new Map<string, number>());
  }
}
