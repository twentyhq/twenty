import { isValidDate } from 'src/utils/date/isValidDate';

type ResolveReceivedAtArgs = {
  headerDate?: string;
  internalDate?: Date | string;
};

export const resolveReceivedAt = ({
  headerDate,
  internalDate,
}: ResolveReceivedAtArgs): Date => {
  const receivedAtFromHeader = headerDate ? new Date(headerDate) : undefined;

  if (isValidDate(receivedAtFromHeader)) {
    return receivedAtFromHeader;
  }

  const receivedAtFromImap = internalDate ? new Date(internalDate) : undefined;

  if (isValidDate(receivedAtFromImap)) {
    return receivedAtFromImap;
  }

  return new Date();
};
