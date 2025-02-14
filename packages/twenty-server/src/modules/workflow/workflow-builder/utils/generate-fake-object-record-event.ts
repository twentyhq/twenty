import { v4 } from 'uuid';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BaseOutputSchema } from 'src/modules/workflow/workflow-builder/types/output-schema.type';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/utils/generate-fake-object-record';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

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
    acc[key] = { isLeaf: true, value, label: camelToTitleCase(key) };

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
      'properties.after': {
        isLeaf: false,
        value: after,
        label: 'Record Fields',
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
          before: { isLeaf: false, value: before, label: 'Before Update' },
          after: { isLeaf: false, value: after, label: 'After Update' },
        },
        label: 'Record Fields',
      },
    };
  }

  if (action === DatabaseEventAction.DELETED) {
    return {
      ...baseResult,
      'properties.before': {
        isLeaf: false,
        value: before,
        label: 'Record Fields',
      },
    };
  }

  if (action === DatabaseEventAction.DESTROYED) {
    return {
      ...baseResult,
      'properties.before': {
        isLeaf: false,
        value: before,
        label: 'Record Fields',
      },
    };
  }

  throw new Error(`Unknown action '${action}'`);
};
