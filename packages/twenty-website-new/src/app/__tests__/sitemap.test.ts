import sitemap from '@/app/sitemap';

const pathnameOf = (url: string): string => new URL(url).pathname;

describe('sitemap', () => {
  it('emits only indexed public website routes', () => {
    const entries = sitemap();
    const pathnames = entries.map((entry) => pathnameOf(entry.url));

    expect(pathnames).toContain('/');
    expect(pathnames).toContain('/product');
    expect(pathnames).toContain('/fr/product');
    expect(pathnames).not.toContain('/fr-FR/product');
    expect(pathnames).toContain('/customers/9dots');
    expect(pathnames).not.toContain('/de-DE/product');
    expect(pathnames).not.toContain('/halftone');
    expect(pathnames).not.toContain('/enterprise/activate');
  });

  it('emits hreflang alternates with AppLocale keys but URL-segment paths', () => {
    const productEntry = sitemap().find(
      (entry) => pathnameOf(entry.url) === '/product',
    );

    expect(productEntry?.alternates?.languages).toMatchObject({
      en: expect.stringMatching(/\/product$/),
      'fr-FR': expect.stringMatching(/\/fr\/product$/),
      'x-default': expect.stringMatching(/\/product$/),
    });
    expect(productEntry?.alternates?.languages).not.toHaveProperty('de-DE');
  });
});
