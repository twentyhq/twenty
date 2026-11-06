import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';

export type RuleRecordShareGrant = Pick<
  RecordShareInput,
  'recordId' | 'principalId' | 'sourceId'
>;
