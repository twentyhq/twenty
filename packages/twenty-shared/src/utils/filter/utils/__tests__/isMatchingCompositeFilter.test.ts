import { FieldMetadataType } from '@/types';
import { COMPOSITE_FIELD_SUB_FIELD_MATCHERS_MAP } from '@/utils/filter/utils/compositeFieldSubFieldMatchersMap';
import { isMatchingCompositeFilter } from '@/utils/filter/utils/isMatchingCompositeFilter';

const LINKS_MATCHERS =
  COMPOSITE_FIELD_SUB_FIELD_MATCHERS_MAP[FieldMetadataType.LINKS] ?? {};

const LINKS_VALUE = {
  primaryLinkUrl: 'https://twenty.com',
  primaryLinkLabel: 'Twenty',
  secondaryLinks: [{ url: 'https://docs.twenty.com', label: 'Docs' }],
};

describe('isMatchingCompositeFilter', () => {
  it('matches when every sub-filter matches', () => {
    expect(
      isMatchingCompositeFilter({
        compositeFilter: {
          primaryLinkUrl: { ilike: '%twenty%' },
          primaryLinkLabel: { eq: 'Twenty' },
        },
        compositeValue: LINKS_VALUE,
        subFieldMatchers: LINKS_MATCHERS,
      }),
    ).toBe(true);
  });

  it('does not match when one sub-filter fails', () => {
    expect(
      isMatchingCompositeFilter({
        compositeFilter: {
          primaryLinkUrl: { ilike: '%twenty%' },
          primaryLinkLabel: { eq: 'Other' },
        },
        compositeValue: LINKS_VALUE,
        subFieldMatchers: LINKS_MATCHERS,
      }),
    ).toBe(false);
  });

  it('ignores absent and empty sub-filters', () => {
    expect(
      isMatchingCompositeFilter({
        compositeFilter: { primaryLinkUrl: {}, primaryLinkLabel: undefined },
        compositeValue: LINKS_VALUE,
        subFieldMatchers: LINKS_MATCHERS,
      }),
    ).toBe(true);
  });

  it('does not match a sub-field without a matcher', () => {
    expect(
      isMatchingCompositeFilter({
        compositeFilter: { unknownSubField: { eq: 'Twenty' } },
        compositeValue: LINKS_VALUE,
        subFieldMatchers: LINKS_MATCHERS,
      }),
    ).toBe(false);
  });

  it('matches a missing value only with IS NULL', () => {
    expect(
      isMatchingCompositeFilter({
        compositeFilter: { primaryLinkLabel: { is: 'NULL' } },
        compositeValue: null,
        subFieldMatchers: LINKS_MATCHERS,
      }),
    ).toBe(true);

    expect(
      isMatchingCompositeFilter({
        compositeFilter: { primaryLinkLabel: { eq: 'Twenty' } },
        compositeValue: { primaryLinkLabel: null },
        subFieldMatchers: LINKS_MATCHERS,
      }),
    ).toBe(false);
  });

  it('matches secondary links through their JSON content', () => {
    expect(
      isMatchingCompositeFilter({
        compositeFilter: { secondaryLinks: { like: '%docs.twenty.com%' } },
        compositeValue: LINKS_VALUE,
        subFieldMatchers: LINKS_MATCHERS,
      }),
    ).toBe(true);
  });
});
