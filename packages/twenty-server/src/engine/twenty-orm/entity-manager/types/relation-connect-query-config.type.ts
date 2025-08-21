import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type UniqueFieldCondition = [field: string, value: string];

export type UniqueConstraintCondition = UniqueFieldCondition[];

export type RelationConnectQueryConfig = {
  targetObjectName: string;
  recordToConnectConditions: UniqueConstraintCondition[];
  relationFieldName: string;
  connectFieldName: string;
  uniqueConstraintFields: FieldMetadataEntity[];
  recordToConnectConditionByEntityIndex: {
    [entityIndex: number]: UniqueConstraintCondition;
  };
};
