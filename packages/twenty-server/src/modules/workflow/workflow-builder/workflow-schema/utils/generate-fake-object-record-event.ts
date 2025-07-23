import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  FieldOutputSchema,
  RecordOutputSchema,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

const generateFakeObjectRecordEventWithPrefix = ({
  objectMetadataInfo,
  prefix,
}: {
  objectMetadataInfo: ObjectMetadataInfo;
  prefix: string;
}): RecordOutputSchema => {
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
      icon:
        objectMetadataInfo.objectMetadataItemWithFieldsMaps.icon ?? undefined,
      label: objectMetadataInfo.objectMetadataItemWithFieldsMaps.labelSingular,
      value: objectMetadataInfo.objectMetadataItemWithFieldsMaps.description,
      nameSingular:
        objectMetadataInfo.objectMetadataItemWithFieldsMaps.nameSingular,
      fieldIdName: `${prefix}.id`,
      objectMetadataId: objectMetadataInfo.objectMetadataItemWithFieldsMaps.id,
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
