import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { EMAIL_MARGIN_MULTIPLIER } from 'src/modules/emailing/constants/email-margin-multiplier';
import { SES_EMAIL_COST_PER_THOUSAND_DOLLARS } from 'src/modules/emailing/constants/ses-email-cost-per-thousand-dollars';

export const computeEmailCreditsMicro = (emailCount: number): number => {
  const providerCostInDollars =
    (emailCount / 1000) * SES_EMAIL_COST_PER_THOUSAND_DOLLARS;

  return Math.round(
    convertDollarsToBillingCredits(
      providerCostInDollars * EMAIL_MARGIN_MULTIPLIER,
    ),
  );
};
