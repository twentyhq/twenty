import { Injectable, Optional, Type } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { ActivityTargetWorkspaceEntity } from 'src/modules/activity/standard-objects/activity-target.workspace-entity';
import { ActivityWorkspaceEntity } from 'src/modules/activity/standard-objects/activity.workspace-entity';
import { CommentWorkspaceEntity } from 'src/modules/activity/standard-objects/comment.workspace-entity';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { AuditLogWorkspaceEntity } from 'src/modules/timeline/standard-objects/audit-log.workspace-entity';
import { BehavioralEventWorkspaceEntity } from 'src/modules/timeline/standard-objects/behavioral-event.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { ViewSortWorkspaceEntity } from 'src/modules/view/standard-objects/view-sort.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';
import { WebhookWorkspaceEntity } from 'src/modules/webhook/standard-objects/webhook.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class TwentyORMManager {
  constructor(
    @Optional()
    private readonly workspaceDataSource: WorkspaceDataSource | null,
    private readonly entitySchemaFactory: EntitySchemaFactory,
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}

  getRepository<T extends ObjectLiteral>(
    entityClass: Type<T>,
  ): WorkspaceRepository<T> {
    const entitySchema = this.entitySchemaFactory.create(entityClass);

    if (!this.workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    return this.workspaceDataSource.getRepository<T>(entitySchema);
  }

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    entityClass: Type<T>,
  ): Promise<WorkspaceRepository<T>> {
    // TODO: This is a temporary solution to get all workspace entities
    const workspaceEntities = [
      ActivityTargetWorkspaceEntity,
      ActivityWorkspaceEntity,
      ApiKeyWorkspaceEntity,
      AttachmentWorkspaceEntity,
      BlocklistWorkspaceEntity,
      BehavioralEventWorkspaceEntity,
      CalendarChannelEventAssociationWorkspaceEntity,
      CalendarChannelWorkspaceEntity,
      CalendarEventParticipantWorkspaceEntity,
      CalendarEventWorkspaceEntity,
      CommentWorkspaceEntity,
      CompanyWorkspaceEntity,
      ConnectedAccountWorkspaceEntity,
      FavoriteWorkspaceEntity,
      AuditLogWorkspaceEntity,
      MessageChannelMessageAssociationWorkspaceEntity,
      MessageChannelWorkspaceEntity,
      MessageParticipantWorkspaceEntity,
      MessageThreadWorkspaceEntity,
      MessageWorkspaceEntity,
      OpportunityWorkspaceEntity,
      PersonWorkspaceEntity,
      TimelineActivityWorkspaceEntity,
      ViewFieldWorkspaceEntity,
      ViewFilterWorkspaceEntity,
      ViewSortWorkspaceEntity,
      ViewWorkspaceEntity,
      WebhookWorkspaceEntity,
      WorkspaceMemberWorkspaceEntity,
    ];

    const entities = workspaceEntities.map((workspaceEntity) =>
      this.entitySchemaFactory.create(workspaceEntity as any),
    );

    const workspaceDataSource = await this.workspaceDataSourceFactory.create(
      entities,
      workspaceId,
    );

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const entitySchema = this.entitySchemaFactory.create(entityClass);

    return workspaceDataSource.getRepository<T>(entitySchema);
  }
}
