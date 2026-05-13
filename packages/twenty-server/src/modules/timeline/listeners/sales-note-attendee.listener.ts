import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDestroyEvent,
} from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

// Stratum-specific: when a salesNoteAttendee (junction row linking a Call
// Report to a Person) is created, write a timeline activity on the Person's
// record so the new Call Report appears in the Person's Timeline tab.
// Mirrors CalendarEventParticipantListener — same pattern, different
// junction object. The frontend's EventRowDynamicComponent has no
// salesNote-specific case so this row falls through to EventRowMainObject,
// which renders "linked a salesNote with <name>".
//
// salesNote is a CUSTOM object (Stratum app); the workspace event emitter
// still fires standard CRUD events for custom objects, so the
// @OnDatabaseBatchEvent decorator picks them up by name.

type SalesNoteAttendeeMinimal = {
  id: string;
  personId?: string | null;
  salesNoteId?: string | null;
};

type SalesNoteMinimal = {
  id: string;
};

@Injectable()
export class SalesNoteAttendeeTimelineListener {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @OnDatabaseBatchEvent('salesNoteAttendee', DatabaseEventAction.CREATED)
  async handleSalesNoteAttendeeCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<SalesNoteAttendeeMinimal>
    >,
  ): Promise<void> {
    if (!isDefined(batchEvent.workspaceId)) {
      return;
    }

    // Resolve salesNote object metadata id once per batch. If the workspace
    // doesn't have the salesNote object installed, bail silently — this
    // listener is only meaningful when the Stratum sales-notes app is
    // present.
    const salesNoteObjectMetadata = await this.objectMetadataRepository.findOne(
      {
        where: {
          nameSingular: 'salesNote',
          workspaceId: batchEvent.workspaceId,
        },
      },
    );

    if (!isDefined(salesNoteObjectMetadata)) {
      return;
    }

    const payloads = batchEvent.events
      .map((event) => {
        const after = event.properties.after;
        const personId = after?.personId;
        const salesNoteId = after?.salesNoteId;

        if (
          typeof personId !== 'string' ||
          personId.length === 0 ||
          typeof salesNoteId !== 'string' ||
          salesNoteId.length === 0
        ) {
          return undefined;
        }

        return {
          name: 'salesNote.linked',
          properties: {},
          objectSingularName: 'person',
          recordId: personId,
          workspaceMemberId: event.workspaceMemberId,
          linkedObjectMetadataId: salesNoteObjectMetadata.id,
          linkedRecordId: salesNoteId,
          linkedRecordCachedName: '',
        };
      })
      .filter(isDefined);

    if (payloads.length === 0) {
      return;
    }

    await this.timelineActivityRepository.upsertTimelineActivities({
      objectSingularName: 'person',
      workspaceId: batchEvent.workspaceId,
      payloads,
    });
  }

  // When a salesNote is hard-deleted, sweep timelineActivity rows that
  // reference it (name='salesNote.linked', linkedObjectMetadataId=salesNote,
  // linkedRecordId=deleted salesNote id) so the timeline doesn't end up with
  // "Error loading record" rows. Mirrors the cleanup added in commit
  // 6e8c901a0c for messages/threads. Soft-delete (DELETED) is intentionally
  // not handled — the salesNote can still be restored, and the linked
  // record lookup continues to resolve.
  @OnDatabaseBatchEvent('salesNote', DatabaseEventAction.DESTROYED)
  async handleSalesNoteDestroyed(
    batchEvent: WorkspaceEventBatch<ObjectRecordDestroyEvent<SalesNoteMinimal>>,
  ): Promise<void> {
    if (!isDefined(batchEvent.workspaceId)) {
      return;
    }

    const salesNoteObjectMetadata = await this.objectMetadataRepository.findOne(
      {
        where: {
          nameSingular: 'salesNote',
          workspaceId: batchEvent.workspaceId,
        },
      },
    );

    if (!isDefined(salesNoteObjectMetadata)) {
      return;
    }

    const deletedSalesNoteIds = batchEvent.events
      .map((event) => event.recordId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    if (deletedSalesNoteIds.length === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(batchEvent.workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const timelineActivityRepository =
        await this.globalWorkspaceOrmManager.getRepository<TimelineActivityWorkspaceEntity>(
          batchEvent.workspaceId,
          'timelineActivity',
          { shouldBypassPermissionChecks: true },
        );

      await timelineActivityRepository.delete({
        linkedObjectMetadataId: salesNoteObjectMetadata.id,
        linkedRecordId: In(deletedSalesNoteIds),
      });
    }, authContext);
  }
}
