import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

export type UniqueFieldCondition = [field: string, value: string];

export type UniqueConstraintCondition = UniqueFieldCondition[];

export type RelationConnectQueryConfig = {
  targetObjectName: string;
  recordToConnectConditions: UniqueConstraintCondition[];
  relationFieldName: string;
  connectFieldName: string;
  uniqueConstraintFields: FieldMetadataInterface<FieldMetadataType>[];
  recordToConnectConditionByEntityIndex: {
    [entityIndex: number]: UniqueConstraintCondition;
  };
};
