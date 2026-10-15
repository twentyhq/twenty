import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildAgentMessageReactionStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'agentMessageReaction'>, 'context'>,
): Record<string, FlatIndexMetadata> => ({
  messageWorkspaceMemberEmojiUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'messageWorkspaceMemberEmojiUniqueIndex',
      relatedFieldNames: ['message', 'workspaceMember', 'emoji'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    },
  }),
  // Rows without a member are the assistant's, which the member index cannot dedupe
  messageAssistantEmojiUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'messageAssistantEmojiUniqueIndex',
      relatedFieldNames: ['message', 'emoji'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL AND "workspaceMemberId" IS NULL',
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
});
