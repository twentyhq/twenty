import { parseAppReadme } from './parse-app-readme';

describe('parseAppReadme', () => {
  it('splits the README into intro and sections, dropping the title and heading emoji', () => {
    const readme = parseAppReadme(
      '# Slack\n\nIntro\n\n## ✨ What you get\n\nText\n\n## 💳 Billing\n\nFree',
    );

    expect(readme.intro).toEqual([{ kind: 'text', markdown: 'Intro' }]);
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

  it('reads blockquotes as notes', () => {
    const readme = parseAppReadme('## Setup\n\n> Answers can be inaccurate.');

    expect(readme.sections[0].blocks).toEqual([
      { kind: 'note', markdown: 'Answers can be inaccurate.' },
    ]);
  });

  it('flags sections that contain subheadings', () => {
    const readme = parseAppReadme(
      '## Self-hosting\n\nIntro\n\n### 1. Register\n\n1. Visit the page\n\n## Billing\n\nFree',
    );

    expect(readme.sections.map((section) => section.hasSubheadings)).toEqual([
      true,
      false,
    ]);
  });
});
