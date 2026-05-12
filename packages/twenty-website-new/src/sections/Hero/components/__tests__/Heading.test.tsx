import { renderToStaticMarkup } from 'react-dom/server';

import { Heading as HeroHeading } from '@/sections/Hero/components/Heading';
import { Pages } from '@/lib/pages';

describe('Hero.Heading defaults', () => {
  it('renders <h1> by default', () => {
    const html = renderToStaticMarkup(
      <HeroHeading page={Pages.Home}>Page title</HeroHeading>,
    );
    expect(html).toContain('<h1');
    expect(html).toContain('Page title');
    expect(html).toContain('</h1>');
  });

  it('still allows callers to override as for legacy or special cases', () => {
    const html = renderToStaticMarkup(
      <HeroHeading as="h2" page={Pages.Home}>
        Forced h2
      </HeroHeading>,
    );
    expect(html).toContain('<h2');
    expect(html).not.toContain('<h1');
  });
});
