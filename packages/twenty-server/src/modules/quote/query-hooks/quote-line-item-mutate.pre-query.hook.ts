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

// Twenty mutation payloads use composite field names (e.g. `fixedFeeAmount`,
// `hourlyRate`) not flat column names (e.g. `fixedFeeAmountAmountMicros`).
// The composite value is { amountMicros: number | null, currencyCode: string }.
type CurrencyInput = { amountMicros?: number | null } | null | undefined;

function amountIsMissing(field: CurrencyInput): boolean {
  if (field == null) return true;
  const m = field.amountMicros;

  return m == null; // null or undefined — 0 is a valid amount
}

// Validate and strip fields irrelevant to the selected fee type.
// isPartialUpdate=true (updateOne) skips presence checks for fields not
// included in the payload — they are already stored on the record.
function validateAndStripFeeTypeFields(
  data: Record<string, unknown>,
  isPartialUpdate = false,
): Record<string, unknown> {
  const feeType = data['feeType'] as string | undefined;

  if (!feeType) {
    return data;
  }

  const cleaned = { ...data };

  if (feeType === FEE_TYPE_FIXED) {
    const amountExplicitlySet = 'fixedFeeAmount' in cleaned;

    if (
      !isPartialUpdate || amountExplicitlySet
        ? amountIsMissing(cleaned['fixedFeeAmount'] as CurrencyInput)
        : false
    ) {
      throw new CommonQueryRunnerException(
        'fixedFeeAmount is required when feeType is FIXED_PRICE',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`Fixed Fee Amount is required for a Fixed Price line item.`,
        },
      );
    }

    // Clear T&M-specific fields (composite field names only)
    cleaned['hourlyRate'] = null;
    cleaned['estimatedHours'] = null;
    cleaned['hasTimeCap'] = false;
    cleaned['timeCapHours'] = null;
  }

  if (feeType === FEE_TYPE_TM) {
    const rateExplicitlySet = 'hourlyRate' in cleaned;
    const hoursExplicitlySet = 'estimatedHours' in cleaned;

    if (
      !isPartialUpdate || rateExplicitlySet
        ? amountIsMissing(cleaned['hourlyRate'] as CurrencyInput)
        : false
    ) {
      throw new CommonQueryRunnerException(
        'hourlyRate is required when feeType is TIME_AND_MATERIALS',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`Hourly Rate is required for a Time & Materials line item.`,
        },
      );
    }

    if (
      (!isPartialUpdate || hoursExplicitlySet) &&
      (cleaned['estimatedHours'] === null ||
        cleaned['estimatedHours'] === undefined)
    ) {
      throw new CommonQueryRunnerException(
        'estimatedHours is required when feeType is TIME_AND_MATERIALS',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`Estimated Hours is required for a Time & Materials line item.`,
        },
      );
    }

    // Clear Fixed-specific fields (composite field name only)
    cleaned['fixedFeeAmount'] = null;
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
        true,
      ),
    };
  }
}
