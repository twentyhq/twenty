import { v4 } from 'uuid';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/utils/generate-fake-object-record';
import { OutputSchema } from 'src/modules/workflow/workflow-builder/types/output-schema.type';

export const generateFakeObjectRecordEvent = (
  objectMetadataEntity: ObjectMetadataEntity,
  action: DatabaseEventAction,
): OutputSchema => {
  const recordId = v4();
  const userId = v4();
  const workspaceMemberId = v4();

  const after = generateFakeObjectRecord(objectMetadataEntity);
  const formattedObjectMetadataEntity = Object.entries(
    objectMetadataEntity,
  ).reduce((acc: OutputSchema, [key, value]) => {
    acc[key] = { isLeaf: true, value };

    return acc;
  }, {});

  const baseResult: OutputSchema = {
    recordId: { isLeaf: true, type: 'string', value: recordId },
    userId: { isLeaf: true, type: 'string', value: userId },
    workspaceMemberId: {
      isLeaf: true,
      type: 'string',
      value: workspaceMemberId,
    },
    objectMetadata: {
      isLeaf: false,
      value: formattedObjectMetadataEntity,
    },
  };

  if (action === DatabaseEventAction.CREATED) {
    return {
      ...baseResult,
      properties: {
        isLeaf: false,
        value: { after: { isLeaf: false, value: after } },
      },
    };
  }

  const before = generateFakeObjectRecord(objectMetadataEntity);

  if (action === DatabaseEventAction.UPDATED) {
    return {
      ...baseResult,
      properties: {
        isLeaf: false,
        value: {
          before: { isLeaf: false, value: before },
          after: { isLeaf: false, value: after },
        },
      },
    };
  }

  if (action === DatabaseEventAction.DELETED) {
    return {
      ...baseResult,
      properties: {
        isLeaf: false,
        value: {
          before: { isLeaf: false, value: before },
        },
      },
    };
  }

  if (action === DatabaseEventAction.DESTROYED) {
    return {
      ...baseResult,
      properties: {
        isLeaf: false,
        value: {
          before: { isLeaf: false, value: before },
        },
      },
    };
  }

  throw new Error(`Unknown action '${action}'`);
};
