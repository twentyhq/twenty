import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildAgentChatThreadStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'agentChatThread'>, 'context'>,
): Record<string, FlatIndexMetadata> => ({
  directMessagePairUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'directMessagePairUniqueIndex',
      relatedFieldNames: [
        'directMessageFirstWorkspaceMemberId',
        'directMessageSecondWorkspaceMemberId',
      ],
      isUnique: true,
      indexWhereClause: null,
    },
  }),
  workspaceMemberIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'workspaceMemberIndex',
      relatedFieldNames: ['workspaceMember'],
      isUnique: false,
      indexWhereClause: null,
    },
  }),
  assigneeIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'assigneeIndex',
      relatedFieldNames: ['assignee'],
      isUnique: false,
      indexWhereClause: null,
    },
  }),
  channelLastActivityIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'channelLastActivityIndex',
      relatedFieldNames: ['channelId', 'lastActivityAt'],
      isUnique: false,
      indexWhereClause: null,
    },
  }),
});
