import { v4 } from 'uuid';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BaseOutputSchema } from 'src/modules/workflow/workflow-builder/types/output-schema.type';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/utils/generate-fake-object-record';

export const generateFakeObjectRecordEvent = (
  objectMetadataEntity: ObjectMetadataEntity,
  action: DatabaseEventAction,
): BaseOutputSchema => {
  const recordId = v4();
  const userId = v4();
  const workspaceMemberId = v4();

  const after = generateFakeObjectRecord(objectMetadataEntity);
  const formattedObjectMetadataEntity = Object.entries(
    objectMetadataEntity,
  ).reduce((acc: BaseOutputSchema, [key, value]) => {
    acc[key] = { isLeaf: true, value };

    return acc;
  }, {});

  const baseResult: BaseOutputSchema = {
    recordId: {
      isLeaf: true,
      type: 'string',
      value: recordId,
      label: 'Record ID',
    },
    userId: { isLeaf: true, type: 'string', value: userId, label: 'User ID' },
    workspaceMemberId: {
      isLeaf: true,
      type: 'string',
      value: workspaceMemberId,
      label: 'Workspace Member ID',
    },
    objectMetadata: {
      isLeaf: false,
      value: formattedObjectMetadataEntity,
      label: 'Object Metadata',
    },
  };

  if (action === DatabaseEventAction.CREATED) {
    return {
      ...baseResult,
      properties: {
        isLeaf: false,
        value: { after: { isLeaf: false, value: after, label: 'After' } },
        label: 'Record fields',
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
          before: { isLeaf: false, value: before, label: 'Before' },
          after: { isLeaf: false, value: after, label: 'After' },
        },
        label: 'Record fields',
      },
    };
  }

  if (action === DatabaseEventAction.DELETED) {
    return {
      ...baseResult,
      properties: {
        isLeaf: false,
        value: {
          before: { isLeaf: false, value: before, label: 'Before' },
        },
        label: 'Record fields',
      },
    };
  }

  if (action === DatabaseEventAction.DESTROYED) {
    return {
      ...baseResult,
      properties: {
        isLeaf: false,
        value: {
          before: { isLeaf: false, value: before, label: 'Before' },
        },
        label: 'Record fields',
      },
    };
  }

  throw new Error(`Unknown action '${action}'`);
};
