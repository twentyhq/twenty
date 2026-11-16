import { extractInboxMessageMentionedWorkspaceMemberIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-inbox-message-mentioned-workspace-member-ids.util';

const MIA_ID = '20202020-0687-4c41-b707-ed1bfca972a7';
const LEO_ID = '20202020-1553-45c6-a028-5a9064cce07f';

describe('extractInboxMessageMentionedWorkspaceMemberIds', () => {
  it('reads the members mentioned in Markdown text, not in code or other references', () => {
    expect(
      extractInboxMessageMentionedWorkspaceMemberIds(
        `[[record:workspaceMember:${MIA_ID}:Mia Lee]], can you review [[record:company:20202020-0000-4000-8000-000000000003:Acme]]? Write \`[[record:workspaceMember:${LEO_ID}:Leo]]\` to ping Leo.`,
      ),
    ).toEqual([MIA_ID]);
  });
});
