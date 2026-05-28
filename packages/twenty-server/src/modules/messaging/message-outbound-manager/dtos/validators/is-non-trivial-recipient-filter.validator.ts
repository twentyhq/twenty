import {
  type ValidationArguments,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { isNonTrivialRecipientFilter } from 'src/modules/messaging/message-outbound-manager/utils/is-non-trivial-recipient-filter.util';

@ValidatorConstraint({ name: 'IsNonTrivialRecipientFilter', async: false })
export class IsNonTrivialRecipientFilter
  implements ValidatorConstraintInterface
{
  validate(value: unknown): boolean {
    return isNonTrivialRecipientFilter(
      value as RecordGqlOperationFilter | null | undefined,
    );
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'recipientFilter must contain at least one real constraint; an empty filter is not allowed.';
  }
}
