import { type ConnectedAccountEmailFields, EmailOperation } from '@/types';
import { canConnectedAccountPerformEmailOperation } from '@/utils/email/canConnectedAccountPerformEmailOperation';
import { isDefined } from '@/utils/validation/isDefined';

export const canConnectedAccountSendEmail = (
  connectedAccount: ConnectedAccountEmailFields & {
    archivedAt?: string | null;
  },
): boolean =>
  !isDefined(connectedAccount.archivedAt) &&
  canConnectedAccountPerformEmailOperation({
    connectedAccount,
    operation: EmailOperation.SEND,
  });
