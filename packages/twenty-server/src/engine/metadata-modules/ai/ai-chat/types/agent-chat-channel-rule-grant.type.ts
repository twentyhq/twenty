import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';

export type AgentChatChannelRuleGrant = Pick<
  RecordShareInput,
  'recordId' | 'principalId' | 'sourceId'
>;
