import { buildPartnerIntroPrefill } from './partner-intro-prefill';

describe('buildPartnerIntroPrefill', () => {
  it('maps name and email and folds company into notes', () => {
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

  it('trims inputs and omits blank ones', () => {
    expect(
      buildPartnerIntroPrefill({ name: '  Ada  ', email: '', company: '   ' }),
    ).toEqual({ name: 'Ada' });
  });

  it('returns an empty prefill for no input', () => {
    expect(buildPartnerIntroPrefill({})).toEqual({});
  });
});
