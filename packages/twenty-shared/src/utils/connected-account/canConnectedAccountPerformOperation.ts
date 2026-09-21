import {
  ConnectedAccountOperation,
  type ConnectedAccountOperationFields,
} from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { canConnectedAccountCreateCalendarEvent } from '@/utils/connected-account/canConnectedAccountCreateCalendarEvent';
import { canConnectedAccountDraftEmail } from '@/utils/connected-account/canConnectedAccountDraftEmail';
import { canConnectedAccountSendEmail } from '@/utils/connected-account/canConnectedAccountSendEmail';
import { getMissingCalendarEventScopes } from '@/utils/connected-account/getMissingCalendarEventScopes';

export const canConnectedAccountPerformOperation = ({
  connectedAccount,
  operation,
}: {
  connectedAccount: ConnectedAccountOperationFields;
  operation: ConnectedAccountOperation;
}): boolean => {
  switch (operation) {
    case ConnectedAccountOperation.SEND_EMAIL:
      return canConnectedAccountSendEmail(connectedAccount);
    case ConnectedAccountOperation.DRAFT_EMAIL:
      return canConnectedAccountDraftEmail(connectedAccount);
    case ConnectedAccountOperation.CREATE_CALENDAR_EVENT:
      return (
        canConnectedAccountCreateCalendarEvent(connectedAccount) &&
        getMissingCalendarEventScopes(connectedAccount).length === 0
      );
    default:
      return assertUnreachable(
        operation,
        `Unhandled connected account operation: ${operation}`,
      );
  }
};
