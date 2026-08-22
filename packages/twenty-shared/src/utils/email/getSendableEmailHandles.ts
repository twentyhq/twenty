import { isNonEmptyString } from '@sniptt/guards';

export const getSendableEmailHandles = ({
  handle,
  handleAliases,
}: {
  handle: string;
  handleAliases?: string[] | null;
}): string[] => [handle, ...(handleAliases ?? [])].filter(isNonEmptyString);
