import { renderToStaticMarkup } from 'react-dom/server';

import { PartnerAvatar } from '../components/PartnerAvatar';

describe('PartnerAvatar', () => {
  it('renders the profile picture when a safe URL is provided', () => {
    const html = renderToStaticMarkup(
      <PartnerAvatar
        name="Jane Doe"
        slug="jane-doe"
        profilePictureUrl="https://cdn.example/jane.jpg"
      />,
    );
    expect(html).toContain('<img');
    expect(html).toContain('src="https://cdn.example/jane.jpg"');
  });

  it('falls back to initials when no profile picture is provided', () => {
    const html = renderToStaticMarkup(
      <PartnerAvatar name="Jane Doe" slug="jane-doe" />,
    );
    expect(html).not.toContain('<img');
    expect(html).toContain('JD');
  });

  it.each(['', 'not-a-url', 'javascript:alert(1)', 'data:text/html,<x>'])(
    'falls back to initials for an unsafe or empty URL (%s)',
    (url) => {
      const html = renderToStaticMarkup(
        <PartnerAvatar
          name="Jane Doe"
          slug="jane-doe"
          profilePictureUrl={url}
        />,
      );
      expect(html).not.toContain('<img');
      expect(html).toContain('JD');
    },
  );
});
