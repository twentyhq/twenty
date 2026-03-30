import { Injectable } from '@nestjs/common';
import { msg } from '@lingui/core/macro';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import {
  type CreateOneResolverArgs,
  type UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

const FEE_TYPE_FIXED = 'FIXED_PRICE';
const FEE_TYPE_TM = 'TIME_AND_MATERIALS';

// Shared validation that strips fields irrelevant to the selected fee type
// and checks that required fields are present.
function validateAndStripFeeTypeFields(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const feeType = data['feeType'] as string | undefined;

  if (!feeType) {
    return data;
  }

  const cleaned = { ...data };

  if (feeType === FEE_TYPE_FIXED) {
    if (
      !cleaned['fixedFeeAmountAmountMicros'] &&
      cleaned['fixedFeeAmountAmountMicros'] !== 0
    ) {
      throw new CommonQueryRunnerException(
        'fixedFeeAmountAmountMicros is required when feeType is FIXED_PRICE',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`Fixed Fee Amount is required for a Fixed Price line item.`,
        },
      );
    }

    // Clear T&M-specific fields
    cleaned['hourlyRateAmountMicros'] = null;
    cleaned['hourlyRateCurrencyCode'] = null;
    cleaned['estimatedHours'] = null;
    cleaned['hasTimeCap'] = false;
    cleaned['timeCapHours'] = null;
  }

  if (feeType === FEE_TYPE_TM) {
    if (
      !cleaned['hourlyRateAmountMicros'] &&
      cleaned['hourlyRateAmountMicros'] !== 0
    ) {
      throw new CommonQueryRunnerException(
        'hourlyRateAmountMicros is required when feeType is TIME_AND_MATERIALS',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`Hourly Rate is required for a Time & Materials line item.`,
        },
      );
    }

    if (
      cleaned['estimatedHours'] === null ||
      cleaned['estimatedHours'] === undefined
    ) {
      throw new CommonQueryRunnerException(
        'estimatedHours is required when feeType is TIME_AND_MATERIALS',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`Estimated Hours is required for a Time & Materials line item.`,
        },
      );
    }

    // Clear Fixed-specific fields
    cleaned['fixedFeeAmountAmountMicros'] = null;
    cleaned['fixedFeeAmountCurrencyCode'] = null;
  }

  // If time cap is explicitly disabled, clear the cap hours field
  if (cleaned['hasTimeCap'] === false) {
    cleaned['timeCapHours'] = null;
  }

  return cleaned;
}

@WorkspaceQueryHook('lineItem.createOne')
@Injectable()
export class QuoteLineItemCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs,
  ): Promise<CreateOneResolverArgs> {
    if (!payload.data['feeType']) {
      return payload;
    }

    return {
      ...payload,
      data: validateAndStripFeeTypeFields(
        payload.data as Record<string, unknown>,
      ),
    };
  }
}

@WorkspaceQueryHook('lineItem.updateOne')
@Injectable()
export class QuoteLineItemUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    if (!payload.data['feeType']) {
      return payload;
    }

    return {
      ...payload,
      data: validateAndStripFeeTypeFields(
        payload.data as Record<string, unknown>,
      ),
    };
  }
}
