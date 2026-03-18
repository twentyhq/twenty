import { msg } from '@lingui/core/macro';
import { DataSource } from 'typeorm';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { StateTransitionValidatorService } from 'src/engine/core-modules/state-transition/state-transition-validator.service';
import { OpportunityUpdateOnePreQueryHook } from 'src/modules/opportunity/query-hooks/opportunity-update-one.pre-query.hook';

const MOCK_WORKSPACE_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const MOCK_OPPORTUNITY_ID = '11111111-2222-3333-4444-555555555555';

const mockAuthContext = {
  workspace: { id: MOCK_WORKSPACE_ID },
} as any;

function makePayload(data: Record<string, unknown>) {
  return { id: MOCK_OPPORTUNITY_ID, data };
}

describe('OpportunityUpdateOnePreQueryHook', () => {
  let hook: OpportunityUpdateOnePreQueryHook;
  let mockQuery: jest.Mock;
  let mockValidate: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    mockValidate = jest.fn();

    const mockDataSource = { query: mockQuery } as unknown as DataSource;
    const mockValidatorService = {
      validate: mockValidate,
    } as unknown as StateTransitionValidatorService;

    hook = new OpportunityUpdateOnePreQueryHook(
      mockDataSource,
      mockValidatorService,
    );
  });

  // ── Early-exit guard ────────────────────────────────────────────────────────

  it('should return payload unchanged when stage is not in payload.data', async () => {
    const payload = makePayload({ companyId: 'some-uuid' });

    const result = await hook.execute(mockAuthContext, 'opportunity', payload);

    expect(result).toBe(payload);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockValidate).not.toHaveBeenCalled();
  });

  // ── Record-not-found ────────────────────────────────────────────────────────

  it('should throw RECORD_NOT_FOUND when DB returns no rows', async () => {
    mockQuery.mockResolvedValue([]);

    const payload = makePayload({ stage: 'QUOTE_REQUESTED' });

    let caughtError: unknown;

    try {
      await hook.execute(mockAuthContext, 'opportunity', payload);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(CommonQueryRunnerException);
    expect((caughtError as CommonQueryRunnerException).code).toBe(
      CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
    );
  });

  // ── Validator integration ───────────────────────────────────────────────────

  it('should call validate with the fetched record and target stage', async () => {
    const dbRow = { stage: 'LEAD', companyId: 'some-uuid' };

    mockQuery.mockResolvedValueOnce([dbRow]);

    const payload = makePayload({ stage: 'QUOTE_REQUESTED' });

    await hook.execute(mockAuthContext, 'opportunity', payload);

    expect(mockValidate).toHaveBeenCalledTimes(1);
    const [_config, record, targetStage] = mockValidate.mock.calls[0];

    expect(record).toEqual(dbRow);
    expect(targetStage).toBe('QUOTE_REQUESTED');
  });

  it('should query the opportunity table and pass the opportunity id as parameter', async () => {
    mockQuery.mockResolvedValueOnce([{ stage: 'LEAD', companyId: null }]);
    mockValidate.mockReturnValueOnce(undefined);

    const payload = makePayload({ stage: 'LEAD' });

    await hook.execute(mockAuthContext, 'opportunity', payload);

    const [sql, params] = mockQuery.mock.calls[0];

    expect(sql).toContain('"opportunity"');
    expect(params).toContain(MOCK_OPPORTUNITY_ID);
  });

  // ── Validator exception propagation ────────────────────────────────────────

  it('should propagate exception thrown by the validator', async () => {
    mockQuery.mockResolvedValueOnce([{ stage: 'LEAD', companyId: null }]);
    mockValidate.mockImplementationOnce(() => {
      throw new CommonQueryRunnerException(
        'A Client Account must be linked before advancing to this stage.',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        { userFriendlyMessage: msg`Validation failed.` },
      );
    });

    const payload = makePayload({ stage: 'QUOTE_REQUESTED' });

    await expect(
      hook.execute(mockAuthContext, 'opportunity', payload),
    ).rejects.toThrow(CommonQueryRunnerException);
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it('should return payload when validation passes', async () => {
    mockQuery.mockResolvedValueOnce([
      { stage: 'LEAD', companyId: 'some-uuid' },
    ]);
    mockValidate.mockReturnValueOnce(undefined);

    const payload = makePayload({ stage: 'QUOTE_REQUESTED' });

    const result = await hook.execute(mockAuthContext, 'opportunity', payload);

    expect(result).toBe(payload);
  });
});
