import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '../isDefined';

export const isPhoneWithNonEmptyNumber = <
  TPhone extends { number?: string | null },
>(
  phone: TPhone | null | undefined,
): phone is TPhone & { number: string } =>
  isDefined(phone) && isNonEmptyString(phone.number);
