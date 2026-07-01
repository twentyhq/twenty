import { resolvePartnerScopeCards } from './resolve-partner-scope-cards';

describe('resolvePartnerScopeCards', () => {
  it('returns only selected scopes in priority order', () => {
    const cards = resolvePartnerScopeCards([
      'HOSTING',
      'ADVISORY',
      'SOLUTIONING',
    ]);

    expect(cards.map((card) => card.value)).toEqual([
      'SOLUTIONING',
      'ADVISORY',
      'HOSTING',
    ]);
  });

  it('returns an empty list when nothing is selected', () => {
    expect(resolvePartnerScopeCards([])).toEqual([]);
  });
});
