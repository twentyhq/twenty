import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';
import { v4 } from 'uuid';

import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';
import { CAMPAIGN_ENGAGEMENT_EVENT_TYPE } from 'src/modules/emailing/constants/campaign-engagement-event-type.constant';
import { type MessageCampaignFollowUpDraftDTO } from 'src/modules/emailing/dtos/message-campaign-follow-up-draft.dto';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { MessageListAccessService } from 'src/modules/emailing/services/message-list-access.service';
import { type MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { type MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { type MessageListWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type SourceCampaign = Pick<
  MessageCampaignWorkspaceEntity,
  | 'id'
  | 'name'
  | 'subject'
  | 'bodyTemplate'
  | 'fromAddress'
  | 'unsubscribeTopicId'
>;

// Snapshots the clickers of a sent campaign into a new list and opens a draft
// on it. Nothing is sent: the draft goes through the ordinary send action,
// which re-checks suppression and permissions.
@Injectable()
export class CampaignFollowUpService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly messageListAccessService: MessageListAccessService,
    private readonly actorFromAuthContextService: ActorFromAuthContextService,
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
  ) {}

  async createDraftFromClickers({
    messageCampaignId,
    activityFilter,
    userWorkspaceId,
    authContext,
  }: {
    messageCampaignId: string;
    activityFilter: CampaignEngagementActivityFilter;
    userWorkspaceId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<MessageCampaignFollowUpDraftDTO> {
    const workspaceId = authContext.workspace.id;

    await this.messageListAccessService.assertCanReadAndUpdateLists({
      workspaceId,
      userWorkspaceId,
    });

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const clickerPersonIds = await this.findClickerPersonIds({
      workspaceId,
      messageCampaignId,
      activityFilter,
    });

    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction((transactionScope) =>
          this.createInTransaction({
            messageCampaignId,
            clickerPersonIds,
            roleId,
            authContext,
            transactionScope,
          }),
        ),
      authContext,
    );
  }

  private async findClickerPersonIds({
    workspaceId,
    messageCampaignId,
    activityFilter,
  }: {
    workspaceId: string;
    messageCampaignId: string;
    activityFilter: CampaignEngagementActivityFilter;
  }): Promise<string[]> {
    const deliveryIds =
      await this.campaignEngagementEventService.findEngagedDeliveryIds({
        workspaceId,
        messageCampaignId,
        eventType: CAMPAIGN_ENGAGEMENT_EVENT_TYPE.CLICK,
        activityFilter,
      });

    if (deliveryIds.length === 0) {
      return [];
    }

    const deliveries = await this.campaignDeliveryRepository.find(workspaceId, {
      where: { id: In(deliveryIds), campaignId: messageCampaignId },
      select: { personId: true },
    });

    return [...new Set(deliveries.map((delivery) => delivery.personId))];
  }

  private async createInTransaction({
    messageCampaignId,
    clickerPersonIds,
    roleId,
    authContext,
    transactionScope,
  }: {
    messageCampaignId: string;
    clickerPersonIds: string[];
    roleId: string;
    authContext: WorkspaceAuthContext;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<MessageCampaignFollowUpDraftDTO> {
    const campaignRepository =
      transactionScope.getRepository<MessageCampaignWorkspaceEntity>(
        'messageCampaign',
        { unionOf: [roleId] },
      );
    const personRepository =
      transactionScope.getRepository<PersonWorkspaceEntity>('person', {
        unionOf: [roleId],
      });
    const messageListRepository =
      transactionScope.getRepository<MessageListWorkspaceEntity>(
        'messageList',
        { unionOf: [roleId] },
      );
    const messageListMemberRepository =
      transactionScope.getRepository<MessageListMemberWorkspaceEntity>(
        'messageListMember',
        { unionOf: [roleId] },
      );

    // No column projection: fromAddress is a composite field the query
    // builder cannot select by name.
    const sourceCampaign = await campaignRepository.findOne({
      where: { id: messageCampaignId },
    });

    if (!isDefined(sourceCampaign)) {
      throw new EmailingDomainException(
        `Campaign ${messageCampaignId} not found`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_FOUND,
        { userFriendlyMessage: msg`Campaign not found.` },
      );
    }

    // Deleted or unreadable people are skipped, so the list only ever holds
    // contacts this role could have picked by hand.
    const readablePeople =
      clickerPersonIds.length > 0
        ? await personRepository.find({
            where: { id: In(clickerPersonIds) },
            select: { id: true },
          })
        : [];

    const listId = await this.createList({
      sourceCampaign,
      personIds: readablePeople.map((person) => person.id),
      authContext,
      messageListRepository,
      messageListMemberRepository,
    });

    const draftCampaignId = await this.createDraft({
      sourceCampaign,
      listId,
      authContext,
      campaignRepository,
    });

    return {
      messageCampaignId: draftCampaignId,
      listId,
      memberCount: readablePeople.length,
      skippedCount: clickerPersonIds.length - readablePeople.length,
    };
  }

  private async createList({
    sourceCampaign,
    personIds,
    authContext,
    messageListRepository,
    messageListMemberRepository,
  }: {
    sourceCampaign: SourceCampaign;
    personIds: string[];
    authContext: WorkspaceAuthContext;
    messageListRepository: WorkspaceRepository<MessageListWorkspaceEntity>;
    messageListMemberRepository: WorkspaceRepository<MessageListMemberWorkspaceEntity>;
  }): Promise<string> {
    const listId = v4();

    const [listWithActor] =
      await this.actorFromAuthContextService.injectActorFieldsOnCreate({
        records: [
          {
            id: listId,
            name: `${sourceCampaign.name} · clickers`,
            position: 0,
          },
        ],
        objectMetadataNameSingular: 'messageList',
        authContext,
      });

    await messageListRepository.insert(listWithActor);

    if (personIds.length > 0) {
      const membersWithActor =
        await this.actorFromAuthContextService.injectActorFieldsOnCreate({
          records: personIds.map((personId, position) => ({
            listId,
            personId,
            position,
          })),
          objectMetadataNameSingular: 'messageListMember',
          authContext,
        });

      await messageListMemberRepository.insert(membersWithActor);
    }

    return listId;
  }

  private async createDraft({
    sourceCampaign,
    listId,
    authContext,
    campaignRepository,
  }: {
    sourceCampaign: SourceCampaign;
    listId: string;
    authContext: WorkspaceAuthContext;
    campaignRepository: WorkspaceRepository<MessageCampaignWorkspaceEntity>;
  }): Promise<string> {
    const draftCampaignId = v4();

    const [draftWithActor] =
      await this.actorFromAuthContextService.injectActorFieldsOnCreate({
        records: [
          {
            id: draftCampaignId,
            name: `Follow-up: ${sourceCampaign.name}`,
            status: MessageCampaignStatus.DRAFT,
            subject: sourceCampaign.subject,
            bodyTemplate: sourceCampaign.bodyTemplate,
            fromAddress: sourceCampaign.fromAddress,
            unsubscribeTopicId: sourceCampaign.unsubscribeTopicId,
            listId,
          },
        ],
        objectMetadataNameSingular: 'messageCampaign',
        authContext,
      });

    await campaignRepository.insert(draftWithActor);

    return draftCampaignId;
  }
}
