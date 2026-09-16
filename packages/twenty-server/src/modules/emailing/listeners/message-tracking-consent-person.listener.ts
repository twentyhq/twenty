import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { objectRecordChangedProperties } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { MessageTrackingConsentService } from 'src/modules/emailing/services/message-tracking-consent.service';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class MessageTrackingConsentPersonListener {
  constructor(
    private readonly messageTrackingConsentService: MessageTrackingConsentService,
  ) {}

  @OnDatabaseBatchEvent('person', DatabaseEventAction.CREATED)
  async handleCreatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<PersonWorkspaceEntity>
    >,
  ): Promise<void> {
    const personIds = payload.events
      .filter((event) =>
        isNonEmptyString(event.properties.after.emails?.primaryEmail),
      )
      .map((event) => event.recordId);

    await this.messageTrackingConsentService.refreshPeople({
      workspaceId: payload.workspaceId,
      personIds,
    });
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<PersonWorkspaceEntity>
    >,
  ): Promise<void> {
    const personIds = payload.events
      .filter((event) =>
        objectRecordChangedProperties(
          event.properties.before,
          event.properties.after,
        ).includes('emails'),
      )
      .map((event) => event.recordId);

    await this.messageTrackingConsentService.refreshPeople({
      workspaceId: payload.workspaceId,
      personIds,
    });
  }
}
