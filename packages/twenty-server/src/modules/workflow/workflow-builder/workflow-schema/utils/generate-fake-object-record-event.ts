import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
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
  const recordFields = generateObjectRecordFields({
    objectMetadataInfo,
  });
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
): RecordOutputSchema => {
  switch (action) {
    case DatabaseEventAction.CREATED:
    case DatabaseEventAction.UPDATED:
    case DatabaseEventAction.UPSERTED:
      return generateFakeObjectRecordEventWithPrefix({
        objectMetadataInfo,
        prefix: 'properties.after',
      });
    case DatabaseEventAction.DELETED:
    case DatabaseEventAction.DESTROYED:
      return generateFakeObjectRecordEventWithPrefix({
        objectMetadataInfo,
        prefix: 'properties.before',
      });
    default:
      throw new Error(`Unknown action '${action}'`);
  }
};
