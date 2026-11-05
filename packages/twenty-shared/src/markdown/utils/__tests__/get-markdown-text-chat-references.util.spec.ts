import { getMarkdownTextChatReferences } from '@/markdown/utils/get-markdown-text-chat-references.util';

const MIA_MENTION =
  '[[record:workspaceMember:20202020-0687-4c41-b707-ed1bfca972a7:Mia Lee]]';

describe('getMarkdownTextChatReferences', () => {
  it.each([
    ['a paragraph', `Can you check this, ${MIA_MENTION}?`],
    ['a list item', `- ${MIA_MENTION} owns the follow-up`],
    ['a table cell', `| Owner |\n| --- |\n| ${MIA_MENTION} |`],
    [
      'a table cell next to inline code',
      `| Owner | Field |\n| --- | --- |\n| ${MIA_MENTION} | \`stage\` |`,
    ],
    ['a heading', `## For ${MIA_MENTION}`],
    ['a blockquote', `> ${MIA_MENTION} said yes`],
    ['emphasis', `**${MIA_MENTION}**, please review`],
    ['a link label', `[Ask ${MIA_MENTION}](https://example.com)`],
    ['a list item after inline code', `- \`deal\` owned by ${MIA_MENTION}`],
    [
      'text between two code spans',
      `Use \`a\` with ${MIA_MENTION} and \`b\` alone`,
    ],
    ['text after an escaped backslash', `C:\\\\${MIA_MENTION}`],
    ['text followed by a link target', `${MIA_MENTION}(https://example.com)`],
    [
      'text matching a link definition',
      `${MIA_MENTION}\n\n[${MIA_MENTION.slice(2, -2)}]: https://example.com`,
    ],
  ])('should keep a reference in %s', (_, text) => {
    expect(getMarkdownTextChatReferences(text)).toEqual([
      { fullMatch: MIA_MENTION, index: text.indexOf(MIA_MENTION) },
    ]);
  });

  it.each([
    ['inline code', `Write \`${MIA_MENTION}\` to mention someone`],
    ['a fenced code block', `\`\`\`\n${MIA_MENTION}\n\`\`\``],
    ['an unclosed fenced code block', `\`\`\`\n${MIA_MENTION}`],
    ['a tilde fenced code block', `~~~\n${MIA_MENTION}\n~~~`],
    ['an indented code block', `    ${MIA_MENTION}`],
    ['a tab indented code block', `\t${MIA_MENTION}`],
    ['indented code in a blockquote', `>     ${MIA_MENTION}`],
    ['indented code in a list item', `-     ${MIA_MENTION}`],
    [
      'a fenced code block in a list item',
      `- Example:\n\n  \`\`\`\n  ${MIA_MENTION}\n  \`\`\``,
    ],
    [
      'inline code in a table cell',
      `| Syntax |\n| --- |\n| \`${MIA_MENTION}\` |`,
    ],
    ['a code span across lines', `Use \`a\n${MIA_MENTION}\nb\` here`],
    [
      'a code span opened after an escaped backtick',
      `\\\`a \`b\n${MIA_MENTION} c\` d\``,
    ],
    ['an HTML tag', `<span title="${MIA_MENTION}">Mia</span>`],
    ['an HTML block', `<div>\n${MIA_MENTION}\n</div>`],
    ['a link title', `[Docs](https://example.com "${MIA_MENTION}")`],
    [
      'a link definition',
      `See [docs].\n\n[docs]: https://example.com "${MIA_MENTION}"`,
    ],
    [
      'image alt text',
      `![Photo of ${MIA_MENTION}](https://example.com/mia.png)`,
    ],
    [
      'image alt text with a link definition',
      `![Photo of ${MIA_MENTION}][photo]\n\n[photo]: https://example.com/mia.png`,
    ],
    [
      'escaped brackets',
      `\\[\\[record:workspaceMember:20202020-0687-4c41-b707-ed1bfca972a7:Mia Lee\\]\\]`,
    ],
    ['an escaped opening bracket', `\\${MIA_MENTION}`],
  ])('should skip a reference in %s', (_, text) => {
    expect(getMarkdownTextChatReferences(text)).toEqual([]);
  });

  it('should keep a reference whose label holds Markdown syntax', () => {
    const mention =
      '[[record:workspaceMember:20202020-0687-4c41-b707-ed1bfca972a7:Mia `QA` <Lee>]]';

    expect(getMarkdownTextChatReferences(`Ask ${mention} now`)).toEqual([
      { fullMatch: mention, index: 4 },
    ]);
  });

  it('should keep a reference whose closing bracket is escaped', () => {
    const mention = `${MIA_MENTION.slice(0, -2)}\\]]`;

    expect(getMarkdownTextChatReferences(`Type ${mention}`)).toEqual([
      { fullMatch: mention, index: 5 },
    ]);
  });

  it('should keep only the occurrence outside code when a reference repeats', () => {
    const text = `Write \`${MIA_MENTION}\` to ping ${MIA_MENTION}`;

    expect(getMarkdownTextChatReferences(text)).toEqual([
      { fullMatch: MIA_MENTION, index: text.lastIndexOf(MIA_MENTION) },
    ]);
  });

  it('should ignore placeholder delimiters already in the text', () => {
    expect(
      getMarkdownTextChatReferences(
        `\`${MIA_MENTION}\` ${String.fromCodePoint(0xe000)}0${String.fromCodePoint(0xe001)}`,
      ),
    ).toEqual([]);
  });
});
