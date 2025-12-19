import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  type BaseOutputSchema,
  type FieldOutputSchema,
  type RecordOutputSchema,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

const generateFakeObjectRecordEventWithPrefix = ({
  objectMetadataInfo,
  prefix,
}: {
  objectMetadataInfo: ObjectMetadataInfo;
  prefix: string;
}): RecordOutputSchema => {
  const { flatObjectMetadata } = objectMetadataInfo;
  const recordFields = generateObjectRecordFields({ objectMetadataInfo });
  const prefixedRecordFields = Object.entries(recordFields).reduce(
    (acc, [key, value]) => {
      acc[`${prefix}.${key}`] = value;

      return acc;
    },
    {} as Record<string, FieldOutputSchema>,
  );

  return {
    object: {
      isLeaf: true,
      icon: flatObjectMetadata.icon ?? undefined,
      label: flatObjectMetadata.labelSingular,
      value: flatObjectMetadata.description,
      fieldIdName: `${prefix}.id`,
      objectMetadataId: flatObjectMetadata.id,
    },
    fields: prefixedRecordFields,
    _outputSchemaType: 'RECORD',
  };
};

export const generateFakeObjectRecordEvent = (
  objectMetadataInfo: ObjectMetadataInfo,
  action: DatabaseEventAction,
): BaseOutputSchema => {
  const baseFields: BaseOutputSchema = {
    workspaceMemberId: {
      isLeaf: true,
      type: 'string',
      label: 'Workspace Member ID',
      value: null,
    },
  };

  switch (action) {
    case DatabaseEventAction.CREATED: {
      const afterRecord = generateFakeObjectRecordEventWithPrefix({
        objectMetadataInfo,
        prefix: 'properties.after',
      });

      return {
        ...baseFields,
        ...(afterRecord.fields as BaseOutputSchema),
      };
    }
    case DatabaseEventAction.UPDATED: {
      const beforeRecord = generateFakeObjectRecordEventWithPrefix({
        objectMetadataInfo,
        prefix: 'properties.before',
      });
      const afterRecord = generateFakeObjectRecordEventWithPrefix({
        objectMetadataInfo,
        prefix: 'properties.after',
      });

      return {
        ...baseFields,
        ...(beforeRecord.fields as BaseOutputSchema),
        ...(afterRecord.fields as BaseOutputSchema),
        'properties.diff': {
          isLeaf: true,
          type: 'object',
          label: 'Changed Fields',
          value: {},
        },
        'properties.updatedFields': {
          isLeaf: true,
          type: 'array',
          label: 'Updated Field Names',
          value: [],
        },
      };
    }
    case DatabaseEventAction.UPSERTED: {
      const afterRecord = generateFakeObjectRecordEventWithPrefix({
        objectMetadataInfo,
        prefix: 'properties.after',
      });

      return {
        ...baseFields,
        ...(afterRecord.fields as BaseOutputSchema),
        'properties.updatedFields': {
          isLeaf: true,
          type: 'array',
          label: 'Updated Field Names',
          value: [],
        },
      };
    }
    case DatabaseEventAction.DELETED:
    case DatabaseEventAction.DESTROYED: {
      const beforeRecord = generateFakeObjectRecordEventWithPrefix({
        objectMetadataInfo,
        prefix: 'properties.before',
      });

      return {
        ...baseFields,
        ...(beforeRecord.fields as BaseOutputSchema),
      };
    }
    default:
      throw new Error(`Unknown action '${action}'`);
  }
};
