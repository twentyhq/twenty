import { isNonEmptyString } from '@sniptt/guards';

import { type ApplicationBillingPrice } from '@/application/applicationBillingPriceType';
import { isApplicationBillingPriceAmount } from '@/application/isApplicationBillingPriceAmount';
import { isApplicationBillingPriceCurrency } from '@/application/isApplicationBillingPriceCurrency';
import { isApplicationBillingPricePeriod } from '@/application/isApplicationBillingPricePeriod';
import { isApplicationBillingPriceType } from '@/application/isApplicationBillingPriceType';
import { isApplicationBillingPriceUnit } from '@/application/isApplicationBillingPriceUnit';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isDefined } from '@/utils/validation/isDefined';
import { isValidUuid } from '@/utils/validation/isValidUuid';

export const isApplicationBillingPrice = (
  value: unknown,
): value is ApplicationBillingPrice => {
  if (!isPlainObject(value)) {
    return false;
  }

  const {
    universalIdentifier,
    label,
    description,
    type,
    billingPeriod,
    amountCents,
    currency,
    per,
  } = value;

  return (
    isNonEmptyString(universalIdentifier) &&
    isValidUuid(universalIdentifier) &&
    isNonEmptyString(label) &&
    (!isDefined(description) || isNonEmptyString(description)) &&
    isApplicationBillingPriceType(type) &&
    isApplicationBillingPricePeriod(billingPeriod) &&
    isApplicationBillingPriceAmount(amountCents) &&
    (!isDefined(currency) || isApplicationBillingPriceCurrency(currency)) &&
    (!isDefined(per) || isApplicationBillingPriceUnit(per))
  );
};
