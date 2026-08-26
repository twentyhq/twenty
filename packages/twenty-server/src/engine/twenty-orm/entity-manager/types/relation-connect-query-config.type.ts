import { type LiteFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/lite-flat-field-metadata.type';

export type UniqueFieldCondition = [field: string, value: string];

export type UniqueConstraintCondition = UniqueFieldCondition[];

export type RelationConnectQueryConfig = {
  targetObjectName: string;
  recordToConnectConditions: UniqueConstraintCondition[];
  relationFieldName: string;
  connectFieldName: string;
  uniqueConstraintFields: LiteFlatFieldMetadata[];
  recordToConnectConditionByEntityIndex: {
    [entityIndex: number]: UniqueConstraintCondition;
  };
};
