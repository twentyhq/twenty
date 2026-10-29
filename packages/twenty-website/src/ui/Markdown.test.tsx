import { render, screen } from '@testing-library/react';

import { Markdown } from './Markdown';

describe('Markdown', () => {
  it('demotes headings above the floor and keeps the rest', () => {
    render(
      <Markdown
        headingFloor="h3"
        markdown={'# One\n## Two\n### Three\n#### Four'}
      />,
    );
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Four');
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('opens http links in a new tab and leaves other hrefs plain', () => {
    render(
      <Markdown
        markdown={'[site](https://twenty.com) [mail](mailto:hi@twenty.com)'}
      />,
    );
    expect(screen.getByRole('link', { name: 'site' })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(screen.getByRole('link', { name: 'mail' })).not.toHaveAttribute(
      'target',
    );
  });

  it('drops images even when an allow-list names them', () => {
    render(
      <Markdown
        allowedElements={['p', 'img']}
        markdown={'![alt](https://twenty.com/a.png) text'}
      />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('unwraps elements outside the allow-list and renders gfm tables otherwise', () => {
    render(
      <Markdown
        allowedElements={['p', 'strong']}
        markdown={'> **kept** quote'}
      />,
    );
    expect(screen.queryByRole('blockquote')).not.toBeInTheDocument();
    expect(screen.getByText('kept')).toBeInTheDocument();
    render(<Markdown markdown={'| a | b |\n| - | - |\n| 1 | 2 |'} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
