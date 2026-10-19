import { FieldMetadataType } from '@/types';
import { COMPOSITE_FIELD_SUB_FIELD_MATCHERS_MAP } from '@/utils/filter/utils/compositeFieldSubFieldMatchersMap';
import { isMatchingCompositeFilter } from '@/utils/filter/utils/isMatchingCompositeFilter';

const LINKS_MATCHERS =
  COMPOSITE_FIELD_SUB_FIELD_MATCHERS_MAP[FieldMetadataType.LINKS] ?? {};

const isMatchingLinksFilter = (
  compositeFilter: Record<string, object | undefined>,
  compositeValue: Record<string, unknown> | null,
) =>
  isMatchingCompositeFilter({
    compositeFilter,
    compositeValue,
    subFieldMatchers: LINKS_MATCHERS,
  });

const LINKS_VALUE = {
  primaryLinkUrl: 'https://twenty.com',
  primaryLinkLabel: 'Twenty',
  secondaryLinks: [{ url: 'https://docs.twenty.com', label: 'Docs' }],
};

describe('isMatchingCompositeFilter', () => {
  it('matches when every sub-filter matches', () => {
    expect(
      isMatchingLinksFilter(
        {
          primaryLinkUrl: { ilike: '%twenty%' },
          primaryLinkLabel: { eq: 'Twenty' },
        },
        LINKS_VALUE,
      ),
    ).toBe(true);
  });

  it('does not match when one sub-filter fails', () => {
    expect(
      isMatchingLinksFilter(
        {
          primaryLinkUrl: { ilike: '%twenty%' },
          primaryLinkLabel: { eq: 'Other' },
        },
        LINKS_VALUE,
      ),
    ).toBe(false);
  });

  it('ignores absent and empty sub-filters', () => {
    expect(
      isMatchingLinksFilter(
        { primaryLinkUrl: {}, primaryLinkLabel: undefined },
        LINKS_VALUE,
      ),
    ).toBe(true);
  });

  it('does not match a sub-field without a matcher', () => {
    expect(
      isMatchingLinksFilter({ unknownSubField: { eq: 'Twenty' } }, LINKS_VALUE),
    ).toBe(false);
  });

  it('matches a missing value only with IS NULL', () => {
    expect(
      isMatchingLinksFilter({ primaryLinkLabel: { is: 'NULL' } }, null),
    ).toBe(true);

    expect(
      isMatchingLinksFilter(
        { primaryLinkLabel: { eq: 'Twenty' } },
        { primaryLinkLabel: null },
      ),
    ).toBe(false);
  });

  it('matches secondary links through their JSON content', () => {
    expect(
      isMatchingLinksFilter(
        { secondaryLinks: { like: '%docs.twenty.com%' } },
        LINKS_VALUE,
      ),
    ).toBe(true);
  });
});
