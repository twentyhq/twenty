import { DataSource } from 'typeorm';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { QuoteNumberingService } from 'src/modules/quote/services/quote-numbering.service';
import { QuoteCreateOnePreQueryHook } from 'src/modules/quote/query-hooks/quote-create-one.pre-query.hook';
import { QuoteUpdateOnePreQueryHook } from 'src/modules/quote/query-hooks/quote-update-one.pre-query.hook';
import {
  QuoteLineItemCreateOnePreQueryHook,
  QuoteLineItemUpdateOnePreQueryHook,
} from 'src/modules/quote/query-hooks/quote-line-item-mutate.pre-query.hook';

const WORKSPACE_ID = 'bbbbbbbb-0000-0000-0000-000000000001';

const mockAuthContext = {
  workspace: { id: WORKSPACE_ID },
} as any;

// ── QuoteNumberingService ────────────────────────────────────────────────────

describe('QuoteNumberingService', () => {
  function makeService(maxValue: string | null) {
    const mockQuery = jest
      .fn()
      .mockResolvedValue([{ max: maxValue }]);
    const ds = { query: mockQuery } as unknown as DataSource;

    return new QuoteNumberingService(ds);
  }

  it('returns 1 when no quotes exist yet', async () => {
    const service = makeService(null);
    const result = await service.assignNextNumber(WORKSPACE_ID);

    expect(result.quoteNumber).toBe(1);
    expect(result.name).toBe('Q-0001 v1');
  });

  it('increments beyond the current maximum', async () => {
    const service = makeService('7');
    const result = await service.assignNextNumber(WORKSPACE_ID);

    expect(result.quoteNumber).toBe(8);
    expect(result.name).toBe('Q-0008 v1');
  });

  it('formats quoteNumber with four-digit padding', () => {
    const ds = { query: jest.fn() } as unknown as DataSource;
    const service = new QuoteNumberingService(ds);

    expect(service.formatQuoteName(42, 3)).toBe('Q-0042 v3');
    expect(service.formatQuoteName(1000, 1)).toBe('Q-1000 v1');
  });
});

// ── QuoteCreateOnePreQueryHook ───────────────────────────────────────────────

describe('QuoteCreateOnePreQueryHook', () => {
  it('injects quoteNumber, version, and name into payload.data', async () => {
    const mockQuery = jest.fn().mockResolvedValue([{ max: '3' }]);
    const ds = { query: mockQuery } as unknown as DataSource;
    const numbering = new QuoteNumberingService(ds);
    const hook = new QuoteCreateOnePreQueryHook(numbering);

    const payload = { data: { notes: 'Initial quote' } };
    const result = await hook.execute(mockAuthContext, 'quote', payload as any);

    expect(result.data['quoteNumber']).toBe(4);
    expect(result.data['version']).toBe(1);
    expect(result.data['name']).toBe('Q-0004 v1');
    // Original data preserved
    expect(result.data['notes']).toBe('Initial quote');
  });
});

// ── QuoteUpdateOnePreQueryHook ───────────────────────────────────────────────

describe('QuoteUpdateOnePreQueryHook', () => {
  function makeHook(dbRows: unknown[]) {
    const mockQuery = jest.fn().mockResolvedValue(dbRows);
    const ds = { query: mockQuery } as unknown as DataSource;

    return { hook: new QuoteUpdateOnePreQueryHook(ds), mockQuery };
  }

  it('passes through when status is not in payload.data', async () => {
    const { hook } = makeHook([]);
    const payload = { id: 'q-1', data: { notes: 'updated' } };
    const result = await hook.execute(mockAuthContext, 'quote', payload as any);

    expect(result).toBe(payload);
  });

  it('throws INVALID_ARGS_DATA when attempting to set status to SUPERSEDED', async () => {
    const { hook } = makeHook([]);
    const payload = { id: 'q-1', data: { status: 'SUPERSEDED' } };

    await expect(
      hook.execute(mockAuthContext, 'quote', payload as any),
    ).rejects.toMatchObject({
      code: CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    });
  });

  it('throws RECORD_NOT_FOUND when quote does not exist', async () => {
    const { hook } = makeHook([]);
    const payload = { id: 'q-missing', data: { status: 'SENT' } };

    await expect(
      hook.execute(mockAuthContext, 'quote', payload as any),
    ).rejects.toMatchObject({
      code: CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
    });
  });

  it('throws INVALID_ARGS_DATA for a disallowed transition (DRAFT → ACCEPTED)', async () => {
    const { hook } = makeHook([{ status: 'DRAFT' }]);
    const payload = { id: 'q-1', data: { status: 'ACCEPTED' } };

    await expect(
      hook.execute(mockAuthContext, 'quote', payload as any),
    ).rejects.toMatchObject({
      code: CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    });
  });

  it('blocks DRAFT → SENT when no sections with line items exist', async () => {
    const mockQuery = jest
      .fn()
      .mockResolvedValueOnce([{ status: 'DRAFT' }])   // status query
      .mockResolvedValueOnce([{ count: '0' }]);        // section check
    const ds = { query: mockQuery } as unknown as DataSource;
    const hook = new QuoteUpdateOnePreQueryHook(ds);
    const payload = { id: 'q-empty', data: { status: 'SENT' } };

    await expect(
      hook.execute(mockAuthContext, 'quote', payload as any),
    ).rejects.toMatchObject({
      code: CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    });
  });

  it('allows DRAFT → SENT when sections with line items exist', async () => {
    const mockQuery = jest
      .fn()
      .mockResolvedValueOnce([{ status: 'DRAFT' }])
      .mockResolvedValueOnce([{ count: '2' }]);
    const ds = { query: mockQuery } as unknown as DataSource;
    const hook = new QuoteUpdateOnePreQueryHook(ds);
    const payload = { id: 'q-ready', data: { status: 'SENT' } };

    const result = await hook.execute(
      mockAuthContext,
      'quote',
      payload as any,
    );

    expect(result).toBe(payload);
  });

  it('allows SENT → ACCEPTED without additional checks', async () => {
    const { hook } = makeHook([{ status: 'SENT' }]);
    const payload = { id: 'q-2', data: { status: 'ACCEPTED' } };
    const result = await hook.execute(mockAuthContext, 'quote', payload as any);

    expect(result).toBe(payload);
  });
});

// ── QuoteLineItem pre-query hooks ────────────────────────────────────────────

describe('QuoteLineItemCreateOnePreQueryHook', () => {
  const hook = new QuoteLineItemCreateOnePreQueryHook();

  it('passes through when feeType is absent', async () => {
    const payload = { data: { name: 'Service fee' } };
    const result = await hook.execute(
      mockAuthContext,
      'lineItem',
      payload as any,
    );

    expect(result).toBe(payload);
  });

  it('throws when FIXED_PRICE is set without a fixed fee amount', async () => {
    const payload = { data: { feeType: 'FIXED_PRICE' } };

    await expect(
      hook.execute(mockAuthContext, 'lineItem', payload as any),
    ).rejects.toBeInstanceOf(CommonQueryRunnerException);
  });

  it('clears T&M fields when feeType is FIXED_PRICE', async () => {
    const payload = {
      data: {
        feeType: 'FIXED_PRICE',
        fixedFeeAmountAmountMicros: '1000000000',
        fixedFeeAmountCurrencyCode: 'GBP',
        hourlyRateAmountMicros: '50000000',
        estimatedHours: 10,
        hasTimeCap: true,
        timeCapHours: 20,
      },
    };
    const result = await hook.execute(
      mockAuthContext,
      'lineItem',
      payload as any,
    );

    expect(result.data['hourlyRateAmountMicros']).toBeNull();
    expect(result.data['estimatedHours']).toBeNull();
    expect(result.data['hasTimeCap']).toBe(false);
    expect(result.data['timeCapHours']).toBeNull();
  });

  it('throws when TIME_AND_MATERIALS is set without hourly rate', async () => {
    const payload = {
      data: { feeType: 'TIME_AND_MATERIALS', estimatedHours: 5 },
    };

    await expect(
      hook.execute(mockAuthContext, 'lineItem', payload as any),
    ).rejects.toBeInstanceOf(CommonQueryRunnerException);
  });

  it('throws when TIME_AND_MATERIALS is set without estimatedHours', async () => {
    const payload = {
      data: {
        feeType: 'TIME_AND_MATERIALS',
        hourlyRateAmountMicros: '50000000',
      },
    };

    await expect(
      hook.execute(mockAuthContext, 'lineItem', payload as any),
    ).rejects.toBeInstanceOf(CommonQueryRunnerException);
  });

  it('clears fixedFee fields when feeType is TIME_AND_MATERIALS', async () => {
    const payload = {
      data: {
        feeType: 'TIME_AND_MATERIALS',
        hourlyRateAmountMicros: '50000000',
        hourlyRateCurrencyCode: 'GBP',
        estimatedHours: 8,
        fixedFeeAmountAmountMicros: '999000000',
      },
    };
    const result = await hook.execute(
      mockAuthContext,
      'lineItem',
      payload as any,
    );

    expect(result.data['fixedFeeAmountAmountMicros']).toBeNull();
    expect(result.data['fixedFeeAmountCurrencyCode']).toBeNull();
  });

  it('clears timeCapHours when hasTimeCap is false', async () => {
    const payload = {
      data: {
        feeType: 'TIME_AND_MATERIALS',
        hourlyRateAmountMicros: '50000000',
        hourlyRateCurrencyCode: 'GBP',
        estimatedHours: 8,
        hasTimeCap: false,
        timeCapHours: 12,
      },
    };
    const result = await hook.execute(
      mockAuthContext,
      'lineItem',
      payload as any,
    );

    expect(result.data['timeCapHours']).toBeNull();
  });
});

describe('QuoteLineItemUpdateOnePreQueryHook', () => {
  const hook = new QuoteLineItemUpdateOnePreQueryHook();

  it('passes through when feeType is absent', async () => {
    const payload = { id: 'li-1', data: { name: 'Updated name' } };
    const result = await hook.execute(
      mockAuthContext,
      'lineItem',
      payload as any,
    );

    expect(result).toBe(payload);
  });
});
