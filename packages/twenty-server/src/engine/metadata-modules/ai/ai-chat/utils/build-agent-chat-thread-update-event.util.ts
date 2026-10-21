import {
  ObjectRecordUpdateEvent,
  type ObjectRecordDiff,
} from 'twenty-shared/database-events';
import { fastDeepEqual } from 'twenty-shared/utils';

import {
  computeUpdatedFieldsFromDiff,
  objectRecordChangedValues,
} from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildAgentChatThreadUpdateEvent = ({
  threadBefore,
  threadAfter,
  objectMetadata,
  flatFieldMetadataMaps,
}: {
  threadBefore: AgentChatThreadWorkspaceEntity;
  threadAfter: AgentChatThreadWorkspaceEntity;
  objectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ObjectRecordUpdateEvent<AgentChatThreadWorkspaceEntity> | undefined => {
  const diff: Partial<ObjectRecordDiff<AgentChatThreadWorkspaceEntity>> =
    objectRecordChangedValues(
      threadBefore,
      threadAfter,
      objectMetadata,
      flatFieldMetadataMaps,
    );

  // the generic diff omits updatedAt, yet a sent message changes only that and lists sort by it
  if (
    Object.keys(diff).length === 0 &&
    !fastDeepEqual(threadBefore.updatedAt, threadAfter.updatedAt)
  ) {
    diff.updatedAt = {
      before: threadBefore.updatedAt,
      after: threadAfter.updatedAt,
    };
  }

  const updatedFields = computeUpdatedFieldsFromDiff(
    diff,
    objectMetadata,
    flatFieldMetadataMaps,
  );

  if (updatedFields.length === 0) {
    return undefined;
  }

  return Object.assign(
    new ObjectRecordUpdateEvent<AgentChatThreadWorkspaceEntity>(),
    {
      recordId: threadAfter.id,
      properties: {
        before: threadBefore,
        after: threadAfter,
        updatedFields,
        diff,
      },
    },
  );
};
