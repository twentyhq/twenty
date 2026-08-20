import { completenessScore } from './completeness-score';
import { isGhost } from './is-ghost-partner';
import { type RankedMarketplacePartner } from './marketplace-partner';
import { rankPartners } from './rank-partners';

const base: RankedMarketplacePartner = {
  slug: 'x',
  name: 'X',
  description: 'A short description that keeps this partner visible.',
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
  partnerTier: null,
  serviceCount: 0,
  approvedCaseStudyCount: 0,
  approvedCaseStudyWithCoverCount: 0,
  rotationKey: 'b',
};

test('ghost detected, thin is not', () => {
  expect(
    isGhost({ ...base, slug: 'ghost', name: 'Ghost', description: '' }),
  ).toBe(true);
  expect(
    isGhost({
      ...base,
      slug: 'thin',
      name: 'Thin',
      description: 'a real short blurb about us — thin but visible',
    }),
  ).toBe(false);
});

test('awards four points per approved case study with a twelve-point cap', () => {
  expect(completenessScore({ ...base, approvedCaseStudyCount: 0 })).toBe(0);
  expect(completenessScore({ ...base, approvedCaseStudyCount: 1 })).toBe(4);
  expect(completenessScore({ ...base, approvedCaseStudyCount: 3 })).toBe(12);
  expect(completenessScore({ ...base, approvedCaseStudyCount: 4 })).toBe(12);
});

test('one approved case study outweighs picture, calendar and rate together', () => {
  const evidence = { ...base, approvedCaseStudyCount: 1 };
  const cheapFields = {
    ...base,
    profilePictureUrl: 'https://cdn.example.com/face.png',
    calendarLink: 'https://cal.example.com/slot',
    hourlyRateUsd: 200,
  };

  expect(completenessScore(evidence)).toBeGreaterThan(
    completenessScore(cheapFields),
  );
});

test('awards one extra point per approved case study that has a cover', () => {
  expect(
    completenessScore({
      ...base,
      approvedCaseStudyCount: 1,
      approvedCaseStudyWithCoverCount: 1,
    }),
  ).toBe(5);
  expect(
    completenessScore({
      ...base,
      approvedCaseStudyCount: 3,
      approvedCaseStudyWithCoverCount: 3,
    }),
  ).toBe(15);
  expect(
    completenessScore({
      ...base,
      approvedCaseStudyCount: 3,
      approvedCaseStudyWithCoverCount: 1,
    }),
  ).toBe(13);
});

test('never counts more covers than counted case studies', () => {
  expect(
    completenessScore({
      ...base,
      approvedCaseStudyCount: 1,
      approvedCaseStudyWithCoverCount: 3,
    }),
  ).toBe(5);
});

test('caps the cover bonus at the three counted case studies', () => {
  expect(
    completenessScore({
      ...base,
      approvedCaseStudyCount: 5,
      approvedCaseStudyWithCoverCount: 5,
    }),
  ).toBe(15);
});

test('completeness wins over partner tier', () => {
  const completeNew = {
    ...base,
    slug: 'complete-new',
    partnerTier: 'NEW' as const,
    serviceCount: 1,
  };
  const thinAdvanced = {
    ...base,
    slug: 'thin-advanced',
    partnerTier: 'ADVANCED' as const,
  };

  expect(
    rankPartners([thinAdvanced, completeNew]).map(({ slug }) => slug),
  ).toEqual(['complete-new', 'thin-advanced']);
});

test('partner tier wins when completeness is equal', () => {
  // Rotation keys run against the tier order, so this fails if the comparator
  // ever puts rotation before tier.
  const advanced = {
    ...base,
    slug: 'advanced',
    partnerTier: 'ADVANCED' as const,
    rotationKey: 'z',
  };
  const intermediate = {
    ...base,
    slug: 'intermediate',
    partnerTier: 'INTERMEDIATE' as const,
    rotationKey: 'y',
  };
  const newPartner = {
    ...base,
    slug: 'new',
    partnerTier: 'NEW' as const,
    rotationKey: 'x',
  };
  const unranked = { ...base, slug: 'unranked', rotationKey: 'a' };

  expect(
    rankPartners([unranked, newPartner, advanced, intermediate]).map(
      ({ slug }) => slug,
    ),
  ).toEqual(['advanced', 'intermediate', 'new', 'unranked']);
});

test('weekly rotation wins when completeness and tier are equal', () => {
  const hashName = {
    ...base,
    slug: 'hash-name',
    name: '#1_novilin',
    rotationKey: 'z',
  };
  const ordinaryName = {
    ...base,
    slug: 'ordinary-name',
    name: 'Zenith',
    rotationKey: 'a',
  };

  expect(
    rankPartners([hashName, ordinaryName]).map(({ slug }) => slug),
  ).toEqual(['ordinary-name', 'hash-name']);
});

test('the description threshold sits at one hundred and twenty characters', () => {
  expect(completenessScore({ ...base, description: 'x'.repeat(119) })).toBe(0);
  expect(completenessScore({ ...base, description: 'x'.repeat(120) })).toBe(2);
});

test('whitespace alone never earns the description points', () => {
  expect(completenessScore({ ...base, description: ' '.repeat(200) })).toBe(0);
});

test('a full profile scores twenty-three points', () => {
  expect(
    completenessScore({
      ...base,
      description: 'x'.repeat(120),
      profilePictureUrl: 'https://cdn.example.com/face.png',
      serviceCount: 4,
      approvedCaseStudyCount: 3,
      approvedCaseStudyWithCoverCount: 3,
      calendarLink: 'https://cal.example.com/slot',
      hourlyRateUsd: 200,
      partnerScope: ['SOLUTIONING'],
    }),
  ).toBe(23);
});

test('each signal contributes its documented weight', () => {
  expect(completenessScore(base)).toBe(0);
  expect(completenessScore({ ...base, description: 'x'.repeat(120) })).toBe(2);
  expect(completenessScore({ ...base, serviceCount: 1 })).toBe(2);
  expect(
    completenessScore({ ...base, profilePictureUrl: 'https://x.example/p' }),
  ).toBe(1);
  expect(
    completenessScore({ ...base, calendarLink: 'https://cal.example/s' }),
  ).toBe(1);
  expect(completenessScore({ ...base, hourlyRateUsd: 200 })).toBe(1);
  expect(completenessScore({ ...base, projectBudgetMinUsd: 5000 })).toBe(1);
  expect(completenessScore({ ...base, partnerScope: ['SOLUTIONING'] })).toBe(1);
});

test('unused portfolio and client arrays no longer score', () => {
  const withLegacyArrays = {
    ...base,
    portfolio: [
      {
        client: 'Acme',
        title: 'A case study',
        body: '',
        imageUrl: null,
        link: null,
      },
    ],
    clients: [{ name: 'Acme', logoUrl: null }],
    services: [{ title: 'Migration', description: 'We migrate' }],
  };

  expect(completenessScore(withLegacyArrays)).toBe(completenessScore(base));
});
