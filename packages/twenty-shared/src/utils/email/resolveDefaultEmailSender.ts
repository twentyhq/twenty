import { isNonEmptyString } from '@sniptt/guards';

import { type ConnectedAccountEmailFields } from '@/types';
import { canConnectedAccountSendEmail } from '@/utils/email/canConnectedAccountSendEmail';
import { getEmailDomain } from '@/utils/email/getEmailDomain';
import { getSendableEmailHandles } from '@/utils/email/getSendableEmailHandles';
import { isDefined } from '@/utils/validation/isDefined';

type DefaultEmailSenderAccount = ConnectedAccountEmailFields & {
  id: string;
  handle: string;
  handleAliases: string[] | null;
  archivedAt?: string | null;
};

type DefaultEmailSender = {
  connectedAccountId: string;
  fromHandle: string;
};

export const resolveDefaultEmailSender = ({
  accounts,
  personalFromHandle,
  workspaceSenderDomain,
  restrictToConnectedAccountId,
}: {
  accounts: DefaultEmailSenderAccount[];
  personalFromHandle: string | null | undefined;
  workspaceSenderDomain: string | null | undefined;
  restrictToConnectedAccountId?: string;
}): DefaultEmailSender | null => {
  const candidates = accounts
    .filter(
      (account) =>
        (!isDefined(restrictToConnectedAccountId) ||
          account.id === restrictToConnectedAccountId) &&
        canConnectedAccountSendEmail(account),
    )
    .flatMap((account) =>
      getSendableEmailHandles(account).map((handle) => ({
        connectedAccountId: account.id,
        handle,
      })),
    );

  const personalMatch = isDefined(personalFromHandle)
    ? candidates.find(
        ({ handle }) =>
          handle.toLowerCase() === personalFromHandle.toLowerCase(),
      )
    : undefined;

  if (isDefined(personalMatch)) {
    return {
      connectedAccountId: personalMatch.connectedAccountId,
      fromHandle: personalMatch.handle,
    };
  }

  if (!isNonEmptyString(workspaceSenderDomain)) {
    return null;
  }

  const domainMatch = candidates.find(
    ({ handle }) => getEmailDomain(handle) === workspaceSenderDomain,
  );

  return isDefined(domainMatch)
    ? {
        connectedAccountId: domainMatch.connectedAccountId,
        fromHandle: domainMatch.handle,
      }
    : null;
};
