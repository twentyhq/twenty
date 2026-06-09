import { buildPartnerIntroPrefill } from '../partner-intro-prefill';

describe('buildPartnerIntroPrefill', () => {
  it('maps name, email and company into Cal prefill fields', () => {
    expect(
      buildPartnerIntroPrefill({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        company: 'Analytical Engines',
      }),
    ).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      notes: 'Company: Analytical Engines',
    });
  });

  it('trims values before mapping', () => {
    expect(
      buildPartnerIntroPrefill({
        name: '  Ada  ',
        email: '  ada@example.com  ',
        company: '  Acme  ',
      }),
    ).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      notes: 'Company: Acme',
    });
  });

  it('omits empty or whitespace-only fields', () => {
    expect(
      buildPartnerIntroPrefill({ name: '', email: '   ', company: undefined }),
    ).toEqual({});
  });
});
