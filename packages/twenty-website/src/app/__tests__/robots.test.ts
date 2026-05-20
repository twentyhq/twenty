import robots from '@/app/robots';

describe('robots', () => {
  it('disallows API and non-indexed utility routes', () => {
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;

    expect(rule).toMatchObject({
      allow: '/',
      disallow: ['/api/', '/halftone', '/enterprise/activate'],
      userAgent: '*',
    });
  });
});
