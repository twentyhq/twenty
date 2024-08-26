import { computeGmailCategoryLabelId } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-category-label-id.util';

describe('computeGmailCategoryLabelId', () => {
  it('should return correct category label id', () => {
    const result = computeGmailCategoryLabelId('CATEGORY1');

    expect(result).toBe('CATEGORY_CATEGORY1');
  });
});
