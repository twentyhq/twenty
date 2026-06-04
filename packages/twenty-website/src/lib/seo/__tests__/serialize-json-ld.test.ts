import { serializeJsonLd } from '@/lib/seo/serialize-json-ld';

describe('serializeJsonLd', () => {
  it('escapes <, > and / to their \\uXXXX form', () => {
    expect(serializeJsonLd({ value: '<>/' })).toBe(
      '{"value":"\\u003c\\u003e\\u002f"}',
    );
  });

  it('neutralizes a </script> breakout attempt', () => {
    const result = serializeJsonLd({
      name: '</script><script>alert(1)</script>',
    });

    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).not.toContain('</script');
  });

  it('round-trips: the escaped payload parses back to the original data', () => {
    const data = {
      '@context': 'https://schema.org',
      name: 'A & B </script>',
      nested: { items: ['<x>', '/path'] },
    };

    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
