import { Test, type TestingModule } from '@nestjs/testing';

import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { OpportunityLoanToValueRatioService } from 'src/modules/opportunity/query-hooks/opportunity-loan-to-value-ratio.service';
import { OpportunityUpdateOnePreQueryHook } from 'src/modules/opportunity/query-hooks/opportunity-update-one.pre-query.hook';

describe('OpportunityUpdateOnePreQueryHook', () => {
  let hook: OpportunityUpdateOnePreQueryHook;
  let areLoanToValueFieldsEnabled: jest.Mock;
  let getExistingLoanAmountAndFarmPropertyValue: jest.Mock;
  let calculateLoanToValueRatio: jest.Mock;

  const authContext = {
    type: 'system',
    workspace: { id: 'workspace-id' },
  } as unknown as WorkspaceAuthContext;

  beforeEach(async () => {
    areLoanToValueFieldsEnabled = jest.fn();
    getExistingLoanAmountAndFarmPropertyValue = jest.fn();
    calculateLoanToValueRatio = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunityUpdateOnePreQueryHook,
        {
          provide: OpportunityLoanToValueRatioService,
          useValue: {
            areLoanToValueFieldsEnabled,
            getExistingLoanAmountAndFarmPropertyValue,
            calculateLoanToValueRatio,
          },
        },
      ],
    }).compile();

    hook = module.get<OpportunityUpdateOnePreQueryHook>(
      OpportunityUpdateOnePreQueryHook,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('no-ops when the workspace does not have the custom fields (e.g. YCombinator)', async () => {
    areLoanToValueFieldsEnabled.mockResolvedValue(false);

    const payload: UpdateOneResolverArgs = {
      id: 'opportunity-id',
      data: { farmPropertyValue: { amountMicros: 200, currencyCode: 'USD' } },
    };

    const result = await hook.execute(authContext, 'opportunity', payload);

    expect(result).toBe(payload);
    expect(getExistingLoanAmountAndFarmPropertyValue).not.toHaveBeenCalled();
    expect(calculateLoanToValueRatio).not.toHaveBeenCalled();
  });

  it('falls back to the existing value for a field not present in the payload', async () => {
    areLoanToValueFieldsEnabled.mockResolvedValue(true);
    getExistingLoanAmountAndFarmPropertyValue.mockResolvedValue({
      loanAmount: { amountMicros: 150, currencyCode: 'USD' },
      farmPropertyValue: null,
    });
    calculateLoanToValueRatio.mockReturnValue(0.75);

    const payload: UpdateOneResolverArgs = {
      id: 'opportunity-id',
      data: { farmPropertyValue: { amountMicros: 200, currencyCode: 'USD' } },
    };

    const result = await hook.execute(authContext, 'opportunity', payload);

    expect(calculateLoanToValueRatio).toHaveBeenCalledWith(
      { amountMicros: 150, currencyCode: 'USD' },
      { amountMicros: 200, currencyCode: 'USD' },
    );
    expect(result.data.loanToValueRatio).toBe(0.75);
  });

  it('overwrites a client-supplied loanToValueRatio with the computed value', async () => {
    areLoanToValueFieldsEnabled.mockResolvedValue(true);
    getExistingLoanAmountAndFarmPropertyValue.mockResolvedValue({
      loanAmount: { amountMicros: 150, currencyCode: 'USD' },
      farmPropertyValue: { amountMicros: 200, currencyCode: 'USD' },
    });
    calculateLoanToValueRatio.mockReturnValue(null);

    const payload: UpdateOneResolverArgs = {
      id: 'opportunity-id',
      data: { loanToValueRatio: 999 },
    };

    const result = await hook.execute(authContext, 'opportunity', payload);

    expect(result.data.loanToValueRatio).toBeNull();
  });
});
