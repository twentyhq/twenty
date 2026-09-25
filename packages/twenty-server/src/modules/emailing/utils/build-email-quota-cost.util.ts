import { isDefined } from 'twenty-shared/utils';

import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { computeEmailCreditsUsedMicro } from 'src/modules/emailing/utils/compute-email-credits-used-micro.util';

export const buildEmailQuotaCost = (
  emailCount: number | undefined,
): QuotaCost | undefined =>
  isDefined(emailCount)
    ? {
        quantity: emailCount,
        creditsUsedMicro: computeEmailCreditsUsedMicro(emailCount),
      }
    : undefined;
