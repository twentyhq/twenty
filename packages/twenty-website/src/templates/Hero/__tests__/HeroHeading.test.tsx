import { renderToStaticMarkup } from 'react-dom/server';

import { HeroHeading } from '@/templates/Hero/HeroHeading';

describe('HeroHeading defaults', () => {
  it('renders <h1> by default', () => {
    const html = renderToStaticMarkup(<HeroHeading>Page title</HeroHeading>);
    expect(html).toContain('<h1');
    expect(html).toContain('Page title');
    expect(html).toContain('</h1>');
  });

  it('still allows callers to override as for special cases', () => {
    const html = renderToStaticMarkup(
      <HeroHeading as="h2">Forced h2</HeroHeading>,
    );
    expect(html).toContain('<h2');
    expect(html).not.toContain('<h1');
  });
});
