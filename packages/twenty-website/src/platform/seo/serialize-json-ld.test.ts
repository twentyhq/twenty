import { serializeJsonLd } from './serialize-json-ld';

describe('serializeJsonLd', () => {
  it('should escape markup that would close the script tag', () => {
    const serialized = serializeJsonLd({
      name: 'Evil App</script><img src=x onerror=alert(1)>',
    });

    expect(serialized).not.toContain('</script');
    expect(serialized).not.toContain('<img');
    expect(serialized).toContain('\\u003c');
  });

  it('should escape sequences that open an HTML comment', () => {
    expect(serializeJsonLd({ name: '<!--' })).not.toContain('<!--');
  });

  it('should keep the payload parseable and unchanged', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { name: 'Ben & Jerry <Partner>', item: 'https://twenty.com/a?b=1&c=2' },
      ],
    };

    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it('should leave payloads without HTML significant characters untouched', () => {
    const data = { '@type': 'FAQPage', name: 'Plain name' };

    expect(serializeJsonLd(data)).toBe(JSON.stringify(data));
  });
});
