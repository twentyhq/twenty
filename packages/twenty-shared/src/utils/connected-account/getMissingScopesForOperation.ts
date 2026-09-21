import {
  ConnectedAccountOperation,
  type ConnectedAccountOperationFields,
} from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { getMissingCalendarEventScopes } from '@/utils/connected-account/getMissingCalendarEventScopes';

export const getMissingScopesForOperation = ({
  connectedAccount,
  operation,
}: {
  connectedAccount: Pick<
    ConnectedAccountOperationFields,
    'provider' | 'scopes'
  >;
  operation: ConnectedAccountOperation;
}): string[] => {
  switch (operation) {
    case ConnectedAccountOperation.CREATE_CALENDAR_EVENT:
      return getMissingCalendarEventScopes(connectedAccount);
    case ConnectedAccountOperation.SEND_EMAIL:
    case ConnectedAccountOperation.DRAFT_EMAIL:
      return [];
    default:
      return assertUnreachable(
        operation,
        `Unhandled connected account operation: ${operation}`,
      );
  }
};
