import { PARTNER_SCOPE_OPTIONS } from './data/partner-scope-options';
import { PARTNER_SCOPES } from './partner-scopes';
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

  it('has a scope-card option for every PartnerScope value', () => {
    const coveredValues = new Set(
      PARTNER_SCOPE_OPTIONS.map((option) => option.value),
    );

    for (const scope of PARTNER_SCOPES) {
      expect(coveredValues.has(scope)).toBe(true);
    }
  });
});
