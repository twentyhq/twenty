import { type MetadataGqlOperationSignature } from '../../types/MetadataGqlOperationSignature';
import { type RecordGqlOperationSignature } from '../../types/RecordGqlOperationSignature';

export const isRecordGqlOperationSignature = (
  operationSignature:
    | RecordGqlOperationSignature
    | MetadataGqlOperationSignature,
): operationSignature is RecordGqlOperationSignature =>
  'objectNameSingular' in operationSignature;
