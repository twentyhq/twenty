import { type ConnectedAccountEmailFields, EmailOperation } from '@/types';
import { canConnectedAccountPerformEmailOperation } from '@/utils/email/canConnectedAccountPerformEmailOperation';
import { getSendableEmailHandles } from '@/utils/email/getSendableEmailHandles';
import { normalizeSenderDomain } from '@/utils/email/normalizeSenderDomain';
import { isDefined } from '@/utils/validation/isDefined';

export type DefaultEmailSenderAccount = ConnectedAccountEmailFields & {
  id: string;
  handle: string | null;
  handleAliases: string[] | null;
};

export type DefaultEmailSender = {
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
        canConnectedAccountPerformEmailOperation({
          connectedAccount: account,
          operation: EmailOperation.SEND,
        }),
    )
    .flatMap((account) =>
      getSendableEmailHandles({
        handle: account.handle ?? '',
        handleAliases: account.handleAliases,
      }).map((handle) => ({ connectedAccountId: account.id, handle })),
    );

  const normalizedPersonalHandle = personalFromHandle?.trim().toLowerCase();

  const personalMatch = isDefined(normalizedPersonalHandle)
    ? candidates.find(
        ({ handle }) => handle.toLowerCase() === normalizedPersonalHandle,
      )
    : undefined;

  if (isDefined(personalMatch)) {
    return {
      connectedAccountId: personalMatch.connectedAccountId,
      fromHandle: personalMatch.handle,
    };
  }

  const senderDomain = normalizeSenderDomain(workspaceSenderDomain);

  if (!isDefined(senderDomain)) {
    return null;
  }

  const domainMatch = candidates.find(
    ({ handle }) =>
      handle.slice(handle.lastIndexOf('@') + 1).toLowerCase() === senderDomain,
  );

  return isDefined(domainMatch)
    ? {
        connectedAccountId: domainMatch.connectedAccountId,
        fromHandle: domainMatch.handle,
      }
    : null;
};
