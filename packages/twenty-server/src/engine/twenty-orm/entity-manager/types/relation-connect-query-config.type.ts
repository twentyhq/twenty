import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

export type uniqueFieldCondition = [field: string, value: string];

export type uniqueConstraintCondition = uniqueFieldCondition[];

export type RelationConnectQueryConfig = {
  targetObjectName: string;
  recordToConnectConditions: uniqueConstraintCondition[];
  relationFieldName: string;
  connectFieldName: string;
  uniqueConstraintFields: FieldMetadataInterface<FieldMetadataType>[];
  recordToConnectConditonByEntityIndex: {
    [entityIndex: number]: uniqueConstraintCondition;
  };
};
