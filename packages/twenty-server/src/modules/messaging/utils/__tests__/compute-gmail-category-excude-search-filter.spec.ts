import { computeGmailCategoryExcludeSearchFilter } from 'src/modules/messaging/utils/compute-gmail-category-excude-search-filter';

describe('computeGmailCategoryExcludeSearchFilter', () => {
  it('should return correct exclude search filter with empty category array', () => {
    const result = computeGmailCategoryExcludeSearchFilter([]);

    expect(result).toBe('');
  });

  it('should return correct exclude search filter with one category', () => {
    const result = computeGmailCategoryExcludeSearchFilter(['CATEGORY1']);

    expect(result).toBe('-category:CATEGORY1');
  });

  it('should return correct exclude search filter with multiple categories', () => {
    const result = computeGmailCategoryExcludeSearchFilter([
      'CATEGORY1',
      'CATEGORY2',
      'CATEGORY3',
    ]);

    expect(result).toBe(
      '-category:CATEGORY1 -category:CATEGORY2 -category:CATEGORY3',
    );
  });
});
