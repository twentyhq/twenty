import { v4 } from 'uuid';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { BaseOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';
import { removeFieldMapsFromObjectMetadata } from 'src/engine/metadata-modules/utils/remove-field-maps-from-object-metadata.util';
import { ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

export const generateFakeObjectRecordEvent = (
  objectMetadataInfo: ObjectMetadataInfo,
  action: DatabaseEventAction,
): BaseOutputSchema => {
  const recordId = v4();
  const userId = v4();
  const workspaceMemberId = v4();

  const objectMetadata = removeFieldMapsFromObjectMetadata(
    objectMetadataInfo.objectMetadataItemWithFieldsMaps,
  );

  const after = generateFakeObjectRecord(objectMetadataInfo);

  const formattedObjectMetadataEntity = Object.entries(objectMetadata).reduce(
    (acc: BaseOutputSchema, [key, value]) => {
      acc[key] = { isLeaf: true, value, label: camelToTitleCase(key) };

      return acc;
    },
    {},
  );

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

  const before = generateFakeObjectRecord(objectMetadataInfo);

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
