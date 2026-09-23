import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';
import { EMAIL_PRICE_PER_THOUSAND_DOLLARS } from 'src/modules/emailing/constants/email-price-per-thousand-dollars';

export const computeEmailCreditsUsedMicro = (sentEmailCount: number): number =>
  convertDollarsToCreditsMicro(
    (sentEmailCount / 1000) * EMAIL_PRICE_PER_THOUSAND_DOLLARS,
  );
