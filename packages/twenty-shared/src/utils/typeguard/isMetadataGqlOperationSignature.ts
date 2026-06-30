import { type MetadataGqlOperationSignature } from '../../types/MetadataGqlOperationSignature';
import { type RecordGqlOperationSignature } from '../../types/RecordGqlOperationSignature';

export const isMetadataGqlOperationSignature = (
  operationSignature:
    | RecordGqlOperationSignature
    | MetadataGqlOperationSignature,
): operationSignature is MetadataGqlOperationSignature =>
  'metadataName' in operationSignature;
