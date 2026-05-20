import { renderToStaticMarkup } from 'react-dom/server';

import { Heading } from '@/design-system/components';

describe('design-system Heading defaults', () => {
  it('renders <h2> by default', () => {
    const html = renderToStaticMarkup(<Heading>Section title</Heading>);
    expect(html).toMatch(/^<h2[^>]*>.*Section title.*<\/h2>$/s);
  });

  it.each(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const)(
    'honours an explicit as=%s override',
    (tag) => {
      const html = renderToStaticMarkup(<Heading as={tag}>Override</Heading>);
      expect(html).toContain(`<${tag}`);
      expect(html).toContain(`</${tag}>`);
    },
  );
});
