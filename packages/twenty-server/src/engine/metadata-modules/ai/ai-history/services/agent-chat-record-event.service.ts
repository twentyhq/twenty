import { Injectable, Logger } from '@nestjs/common';

import { ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

// Chat threads and their participants are written in SQL, outside the ORM
// that would send these, so each write sends its own change once committed
@Injectable()
export class AgentChatRecordEventService {
  private readonly logger = new Logger(AgentChatRecordEventService.name);

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  // A row with nothing before it was created, and one brought back from the
  // trash was restored. The write has committed, so a failure here must not
  // report it as failed
  async emit({
    workspaceId,
    objectName,
    before,
    after,
  }: {
    workspaceId: string;
    objectName: 'agentChatThread' | 'agentChatThreadParticipant';
    before: ObjectLiteral | null | undefined;
    after: ObjectLiteral | undefined;
  }): Promise<void> {
    if (!isDefined(after)) {
      return;
    }

    try {
      const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
        ]);
      const objectMetadata = findAgentChatFlatObjectMetadata(
        flatObjectMetadataMaps,
        objectName,
      );

      if (!isDefined(objectMetadata)) {
        return;
      }

      // Shaped like the ORM's records, so a row read through it compares field
      // by field with one returned by SQL
      const [recordBefore, recordAfter] = formatResult<
        (ObjectLiteral | null | undefined)[]
      >(
        [before, after],
        objectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      ) as [ObjectLiteral | null | undefined, ObjectLiteral];
      const action = !isDefined(recordBefore)
        ? DatabaseEventAction.CREATED
        : isDefined(recordBefore.deletedAt) && !isDefined(recordAfter.deletedAt)
          ? DatabaseEventAction.RESTORED
          : DatabaseEventAction.UPDATED;
      const event = formatTwentyOrmEventToDatabaseBatchEvent({
        action,
        objectMetadataItem: objectMetadata,
        flatFieldMetadataMaps,
        workspaceId,
        recordsBefore: isDefined(recordBefore) ? [recordBefore] : undefined,
        recordsAfter: [recordAfter],
      });

      if (
        !isDefined(recordBefore) ||
        fastDeepEqual(recordBefore.updatedAt, recordAfter.updatedAt)
      ) {
        this.workspaceEventEmitter.emitDatabaseBatchEvent(event);

        return;
      }

      // Lists sort by updatedAt until the 2.46 upgrade adds lastActivityAt, and
      // apps keep the latest version of a row, so a new updatedAt is sent like
      // any other change, even alone
      const recordEvent =
        event?.events[0] ??
        Object.assign(new ObjectRecordUpdateEvent<ObjectLiteral>(), {
          recordId: recordAfter.id,
          properties: {
            before: recordBefore,
            after: recordAfter,
            updatedFields: [],
            diff: {},
          },
        });

      if ('diff' in recordEvent.properties) {
        recordEvent.properties.updatedFields = [
          ...(recordEvent.properties.updatedFields ?? []),
          'updatedAt',
        ];
        recordEvent.properties.diff = {
          ...recordEvent.properties.diff,
          updatedAt: {
            before: recordBefore.updatedAt,
            after: recordAfter.updatedAt,
          },
        };
      }

      this.workspaceEventEmitter.emitDatabaseBatchEvent<
        ObjectLiteral,
        DatabaseEventAction
      >({
        objectMetadataNameSingular: objectMetadata.nameSingular,
        action,
        events: [recordEvent],
        objectMetadata,
        workspaceId,
      });
    } catch (error) {
      this.logger.error(
        `Could not send the ${objectName} change of workspace ${workspaceId}`,
        error,
      );
    }
  }
}
