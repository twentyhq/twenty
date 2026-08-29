import { isNonEmptyString } from '@sniptt/guards';

export const getSendableEmailHandles = (connectedAccount: {
  handle: string;
  handleAliases?: string[] | null;
}): string[] =>
  [connectedAccount.handle, ...(connectedAccount.handleAliases ?? [])].filter(
    isNonEmptyString,
  );
