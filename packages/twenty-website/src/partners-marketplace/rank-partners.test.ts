import { type MarketplacePartner } from './marketplace-partner';
import { completenessScore } from './completeness-score';
import { isGhost } from './is-ghost-partner';
import { rankPartners } from './rank-partners';

const base: MarketplacePartner = {
  slug: 'x',
  name: 'X',
  description: '',
  calendarLink: '',
  partnerScope: [],
  region: [],
  languagesSpoken: [],
  hourlyRateUsd: null,
  projectBudgetMinUsd: null,
  links: {
    website: null,
    linkedin: null,
    x: null,
    github: null,
  },
  profilePictureUrl: '',
  city: '',
  country: '',
  skills: [],
  services: [],
  portfolio: [],
  clients: [],
};

const rich: MarketplacePartner = {
  ...base,
  slug: 'rich',
  name: 'Rich',
  description: 'x'.repeat(200),
  profilePictureUrl: 'http://img',
  partnerScope: ['SOLUTIONING'],
  hourlyRateUsd: 100,
  calendarLink: 'http://cal',
  services: [{ title: 's', description: 'd' }],
  portfolio: [
    {
      client: 'c',
      title: 't',
      body: 'b',
      imageUrl: null,
      link: null,
    },
  ],
  clients: [{ name: 'n', logoUrl: null }],
};
const thin: MarketplacePartner = {
  ...base,
  slug: 'thin',
  name: 'Thin',
  description: 'a real short blurb about us — thin but visible',
};
const ghost: MarketplacePartner = { ...base, slug: 'ghost', name: 'Ghost' };

test('rich scores higher than thin', () => {
  expect(completenessScore(rich)).toBeGreaterThan(completenessScore(thin));
});
test('ghost detected, thin is not', () => {
  expect(isGhost(ghost)).toBe(true);
  expect(isGhost(thin)).toBe(false);
});
test('rankPartners hides ghosts and orders rich before thin', () => {
  const out = rankPartners([thin, ghost, rich]);
  expect(out.map((p) => p.slug)).toEqual(['rich', 'thin']);
});
