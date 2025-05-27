import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  BaseOutputSchema,
  RecordOutputSchema,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

const generateFakeObjectRecordEventWithPrefix = ({
  objectMetadataEntity,
  prefix,
}: {
  objectMetadataEntity: ObjectMetadataEntity;
  prefix: string;
}): RecordOutputSchema => {
  const recordFields = generateObjectRecordFields(objectMetadataEntity);
  const prefixedRecordFields = Object.entries(recordFields).reduce(
    (acc, [key, value]) => {
      acc[`${prefix}.${key}`] = value;

      return acc;
    },
    {} as BaseOutputSchema,
  );

  return {
    object: {
      isLeaf: true,
      icon: objectMetadataEntity.icon,
      label: objectMetadataEntity.labelSingular,
      value: objectMetadataEntity.description,
      nameSingular: objectMetadataEntity.nameSingular,
      fieldIdName: `${prefix}.id`,
    },
    fields: prefixedRecordFields,
    _outputSchemaType: 'RECORD',
  };
};

export const generateFakeObjectRecordEvent = (
  objectMetadataEntity: ObjectMetadataEntity,
  action: DatabaseEventAction,
): RecordOutputSchema => {
  switch (action) {
    case DatabaseEventAction.CREATED:
    case DatabaseEventAction.UPDATED:
      return generateFakeObjectRecordEventWithPrefix({
        objectMetadataEntity,
        prefix: 'properties.after',
      });
    case DatabaseEventAction.DELETED:
    case DatabaseEventAction.DESTROYED:
      return generateFakeObjectRecordEventWithPrefix({
        objectMetadataEntity,
        prefix: 'properties.before',
      });
    default:
      throw new Error(`Unknown action '${action}'`);
  }
};
