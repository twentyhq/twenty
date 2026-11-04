import { extractInboxMessageMentionedWorkspaceMemberIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-inbox-message-mentioned-workspace-member-ids.util';

const MIA_ID = '20202020-0687-4c41-b707-ed1bfca972a7';
const MIA_MENTION = `[[record:workspaceMember:${MIA_ID}:Mia Lee]]`;

describe('extractInboxMessageMentionedWorkspaceMemberIds', () => {
  it.each([
    ['a paragraph', `Can you check this, ${MIA_MENTION}?`],
    ['a list item', `- ${MIA_MENTION} owns the follow-up`],
    ['a table cell', `| Owner |\n| --- |\n| ${MIA_MENTION} |`],
    ['a heading', `## For ${MIA_MENTION}`],
    ['a blockquote', `> ${MIA_MENTION} said yes`],
    ['emphasis around it', `**${MIA_MENTION}**, please review`],
    [
      'emphasis inside its label',
      `[[record:workspaceMember:${MIA_ID}:Mia *the* Lee]]`,
    ],
  ])('reads a mention in %s', (_, text) => {
    expect(extractInboxMessageMentionedWorkspaceMemberIds(text)).toEqual([
      MIA_ID,
    ]);
  });

  it.each([
    ['inline code', `Write \`${MIA_MENTION}\` to mention someone`],
    ['a fenced code block', `\`\`\`\n${MIA_MENTION}\n\`\`\``],
    ['an indented code block', `Example:\n\n    ${MIA_MENTION}`],
    [
      'escaped brackets',
      `\\[\\[record:workspaceMember:${MIA_ID}:Mia Lee\\]\\]`,
    ],
    ['an HTML block', `<div>\n${MIA_MENTION}\n</div>`],
    ['two blocks', `# [[record:workspaceMember:${MIA_ID}:Mia\nLee]]`],
  ])('ignores a mention in %s', (_, text) => {
    expect(extractInboxMessageMentionedWorkspaceMemberIds(text)).toEqual([]);
  });
});
