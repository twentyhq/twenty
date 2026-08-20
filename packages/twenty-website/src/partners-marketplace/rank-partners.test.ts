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

test('awards two points per approved case study with a six-point cap', () => {
  expect(completenessScore({ ...base, approvedCaseStudyCount: 0 })).toBe(0);
  expect(completenessScore({ ...base, approvedCaseStudyCount: 1 })).toBe(2);
  expect(completenessScore({ ...base, approvedCaseStudyCount: 3 })).toBe(6);
  expect(completenessScore({ ...base, approvedCaseStudyCount: 4 })).toBe(6);
});

test('awards one extra point per approved case study that has a cover', () => {
  expect(
    completenessScore({
      ...base,
      approvedCaseStudyCount: 1,
      approvedCaseStudyWithCoverCount: 1,
    }),
  ).toBe(3);
  expect(
    completenessScore({
      ...base,
      approvedCaseStudyCount: 3,
      approvedCaseStudyWithCoverCount: 3,
    }),
  ).toBe(9);
  expect(
    completenessScore({
      ...base,
      approvedCaseStudyCount: 3,
      approvedCaseStudyWithCoverCount: 1,
    }),
  ).toBe(7);
});

test('caps the cover bonus at the three counted case studies', () => {
  expect(
    completenessScore({
      ...base,
      approvedCaseStudyCount: 5,
      approvedCaseStudyWithCoverCount: 5,
    }),
  ).toBe(9);
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
  const advanced = {
    ...base,
    slug: 'advanced',
    partnerTier: 'ADVANCED' as const,
  };
  const intermediate = {
    ...base,
    slug: 'intermediate',
    partnerTier: 'INTERMEDIATE' as const,
  };
  const newPartner = { ...base, slug: 'new', partnerTier: 'NEW' as const };
  const unranked = { ...base, slug: 'unranked' };

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
