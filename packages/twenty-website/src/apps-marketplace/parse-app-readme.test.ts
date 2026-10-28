import { parseAppReadme } from './parse-app-readme';

describe('parseAppReadme', () => {
  it('drops the title and keeps the text before the first section as intro', () => {
    const readme = parseAppReadme('# Slack\n\n**Your CRM, in Slack.**\n');

    expect(readme.intro).toEqual([
      { kind: 'text', markdown: '**Your CRM, in Slack.**' },
    ]);
    expect(readme.sections).toEqual([]);
  });

  it('splits sections on level-two headings and strips leading emoji', () => {
    const readme = parseAppReadme(
      '## ✨ What you get\n\nText\n\n## 💳 Billing\n\nFree',
    );

    expect(readme.sections.map((section) => section.title)).toEqual([
      'What you get',
      'Billing',
    ]);
  });

  it('turns bold leads into list item titles', () => {
    const readme = parseAppReadme(
      [
        '## Features',
        '',
        '- **Ask questions**: look up a contact',
        '- **Send message** — post to a channel',
        '- **Title only**',
        '- “How many deals?”',
      ].join('\n'),
    );

    expect(readme.sections[0].blocks).toEqual([
      {
        kind: 'list',
        ordered: false,
        items: [
          { title: 'Ask questions', markdown: 'Look up a contact' },
          { title: 'Send message', markdown: 'Post to a channel' },
          { title: 'Title only', markdown: '' },
          { markdown: '“How many deals?”' },
        ],
      },
    ]);
  });

  it('keeps the rest of a titled item as its body', () => {
    const readme = parseAppReadme(
      '## Setup\n\n- **Run it**: type `cmd`\n\n  Then wait for the reply.',
    );

    expect(readme.sections[0].blocks).toEqual([
      {
        kind: 'list',
        ordered: false,
        items: [
          {
            title: 'Run it',
            markdown: 'Type `cmd`\n\nThen wait for the reply.',
          },
        ],
      },
    ]);
  });

  it('keeps wrapped lines with their list item and merges loose lists', () => {
    const readme = parseAppReadme(
      '## Steps\n\n1. Open settings\n   and click Install.\n\n2. Connect',
    );

    expect(readme.sections[0].blocks).toEqual([
      {
        kind: 'list',
        ordered: true,
        items: [
          { markdown: 'Open settings\nand click Install.' },
          { markdown: 'Connect' },
        ],
      },
    ]);
  });

  it('splits a list from the paragraph right above it', () => {
    const readme = parseAppReadme('## Values\n\nSupported values:\n- a\n- b');

    expect(readme.sections[0].blocks).toEqual([
      { kind: 'text', markdown: 'Supported values:' },
      {
        kind: 'list',
        ordered: false,
        items: [{ markdown: 'a' }, { markdown: 'b' }],
      },
    ]);
  });

  it('reads blockquotes as notes and keeps code fences whole', () => {
    const readme = parseAppReadme(
      '## Setup\n\n> Answers can be\n> inaccurate.\n\n```text\na\n\nb\n```',
    );

    expect(readme.sections[0].blocks).toEqual([
      { kind: 'note', markdown: 'Answers can be\ninaccurate.' },
      { kind: 'text', markdown: '```text\na\n\nb\n```' },
    ]);
  });

  it('flags sections that contain subheadings', () => {
    const readme = parseAppReadme(
      '## Self-hosting\n\nIntro\n\n### 1. Register\n\n1. Visit the page',
    );

    expect(readme.sections[0].hasSubheadings).toBe(true);
    expect(readme.sections[0].markdown).toBe(
      'Intro\n\n### 1. Register\n\n1. Visit the page',
    );
  });
});
