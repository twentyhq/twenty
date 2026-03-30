import { DataSource } from 'typeorm';

import { QuoteTotalsService } from 'src/modules/quote/services/quote-totals.service';

const WORKSPACE_ID = 'aaaaaaaa-0000-0000-0000-000000000000';
const SCHEMA = `workspace_${WORKSPACE_ID.replace(/-/g, '')}`;

// Helper: build a mock DataSource whose query() returns given responses
// in order (via mockResolvedValueOnce).
function makeDataSource(responses: unknown[]): {
  mockQuery: jest.Mock;
  dataSource: DataSource;
} {
  const mockQuery = jest.fn();

  responses.forEach((r) => mockQuery.mockResolvedValueOnce(r));

  return { mockQuery, dataSource: { query: mockQuery } as unknown as DataSource };
}

describe('QuoteTotalsService', () => {
  describe('recomputeFromLineItem — FIXED_PRICE line item', () => {
    it('sets estimatedLineAmount to fixedFeeAmount and rolls up section + quote', async () => {
      const lineItemId = 'li-1';
      const sectionId = 'sec-1';
      const quoteId = 'q-1';

      const { mockQuery, dataSource } = makeDataSource([
        // 1. Fetch line item
        [
          {
            feeType: 'FIXED_PRICE',
            fixedFeeAmountAmountMicros: '500000000',
            fixedFeeAmountCurrencyCode: 'GBP',
            hourlyRateAmountMicros: null,
            hourlyRateCurrencyCode: null,
            estimatedHours: null,
            quoteSectionId: sectionId,
          },
        ],
        // 2. UPDATE line item estimatedLineAmount
        [],
        // 3. SUM section line items (subtotal)
        [{ subtotal: '500000000', currencyCode: 'GBP' }],
        // 4. UPDATE section subtotal
        [],
        // 5. SELECT quoteId from section
        [{ quoteId }],
        // 6. SUM section subtotals for quote (base total)
        [{ base: '500000000' }],
        // 7. SUM fee percentages
        [{ pct: '0' }],
        // 8. UPDATE quote totalAmount
        [],
      ]);

      const service = new QuoteTotalsService(dataSource);

      await service.recomputeFromLineItem(WORKSPACE_ID, lineItemId);

      // Verify the line item UPDATE was called with the correct micros
      const [updateLineItemSql, updateLineItemParams] =
        mockQuery.mock.calls[1];

      expect(updateLineItemSql).toContain('"_lineItem"');
      expect(updateLineItemParams).toEqual([
        '500000000',
        'GBP',
        lineItemId,
      ]);

      // Verify the quote UPDATE was called with the correct total
      const [updateQuoteSql, updateQuoteParams] = mockQuery.mock.calls[7];

      expect(updateQuoteSql).toContain('"_quote"');
      expect(updateQuoteParams[0]).toBe('500000000');
      expect(updateQuoteParams[1]).toBe(quoteId);
    });
  });

  describe('recomputeFromLineItem — TIME_AND_MATERIALS line item', () => {
    it('computes estimatedLineAmount as hourlyRate × hours', async () => {
      const lineItemId = 'li-2';
      const sectionId = 'sec-2';
      const quoteId = 'q-2';

      // hourlyRate = £100/hr → stored as 100_000_000 micros
      // estimatedHours = 5 → lineAmount = 100 × 5 = £500 → 500_000_000 micros
      const { mockQuery, dataSource } = makeDataSource([
        [
          {
            feeType: 'TIME_AND_MATERIALS',
            fixedFeeAmountAmountMicros: null,
            fixedFeeAmountCurrencyCode: null,
            hourlyRateAmountMicros: '100000000',
            hourlyRateCurrencyCode: 'GBP',
            estimatedHours: 5,
            quoteSectionId: sectionId,
          },
        ],
        [], // UPDATE line item
        [{ subtotal: '500000000', currencyCode: 'GBP' }],
        [], // UPDATE section
        [{ quoteId }],
        [{ base: '500000000' }],
        [{ pct: '0' }],
        [], // UPDATE quote
      ]);

      const service = new QuoteTotalsService(dataSource);

      await service.recomputeFromLineItem(WORKSPACE_ID, lineItemId);

      const [, updateLineItemParams] = mockQuery.mock.calls[1];

      expect(updateLineItemParams[0]).toBe('500000000');
      expect(updateLineItemParams[1]).toBe('GBP');
    });
  });

  describe('recomputeQuoteTotal — with fee-affecting terms', () => {
    it('applies term percentage on top of base section subtotals', async () => {
      const quoteId = 'q-3';

      // base total = £1000 → 1_000_000_000 micros
      // term = 5% → total = £1050 → 1_050_000_000 micros
      const { mockQuery, dataSource } = makeDataSource([
        [{ base: '1000000000' }], // section subtotals
        [{ pct: '5' }],          // fee percentages
        [],                       // UPDATE quote
      ]);

      const service = new QuoteTotalsService(dataSource);
      const schema = `workspace_${WORKSPACE_ID.replace(/-/g, '')}`;

      await service.recomputeQuoteTotal(schema, quoteId);

      const [, updateParams] = mockQuery.mock.calls[2];

      expect(updateParams[0]).toBe('1050000000');
      expect(updateParams[1]).toBe(quoteId);
    });

    it('passes through zero base total correctly', async () => {
      const { mockQuery, dataSource } = makeDataSource([
        [{ base: '0' }],
        [{ pct: '10' }],
        [],
      ]);

      const service = new QuoteTotalsService(dataSource);
      const schema = `workspace_${WORKSPACE_ID.replace(/-/g, '')}`;

      await service.recomputeQuoteTotal(schema, 'q-empty');

      const [, updateParams] = mockQuery.mock.calls[2];

      expect(updateParams[0]).toBe('0');
    });
  });

  describe('recomputeFromSectionId', () => {
    it('rolls up section and quote without touching any line item', async () => {
      const { mockQuery, dataSource } = makeDataSource([
        [{ subtotal: '200000000', currencyCode: 'USD' }],
        [],
        [{ quoteId: 'q-4' }],
        [{ base: '200000000' }],
        [{ pct: '0' }],
        [],
      ]);

      const service = new QuoteTotalsService(dataSource);

      await service.recomputeFromSectionId(WORKSPACE_ID, 'sec-4');

      // Should NOT have queried the _lineItem table directly for the item row
      expect(mockQuery.mock.calls[0][0]).toContain('"_lineItem"');
      expect(mockQuery.mock.calls[0][0]).toContain('SUM');
    });
  });
});
