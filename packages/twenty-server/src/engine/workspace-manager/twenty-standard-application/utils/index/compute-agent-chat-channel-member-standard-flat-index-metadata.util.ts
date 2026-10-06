import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildAgentChatChannelMemberStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'agentChatChannelMember'>, 'context'>,
): Record<string, FlatIndexMetadata> => ({
  channelWorkspaceMemberUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'channelWorkspaceMemberUniqueIndex',
      relatedFieldNames: ['channel', 'workspaceMember'],
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
});
