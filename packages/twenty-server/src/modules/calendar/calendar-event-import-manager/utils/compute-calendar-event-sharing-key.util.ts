import { isNonEmptyString } from '@sniptt/guards';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const computeCalendarEventSharingKey = ({
  provider,
  eventExternalId,
  iCalUid,
}: {
  provider: ConnectedAccountProvider;
  eventExternalId: string | null;
  iCalUid: string | null;
}): string | undefined => {
  switch (provider) {
    case ConnectedAccountProvider.GOOGLE:
      return isNonEmptyString(eventExternalId) && isNonEmptyString(iCalUid)
        ? JSON.stringify([eventExternalId, iCalUid])
        : undefined;
    case ConnectedAccountProvider.MICROSOFT:
      return isNonEmptyString(iCalUid) ? iCalUid : undefined;
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
    case ConnectedAccountProvider.OIDC:
    case ConnectedAccountProvider.SAML:
    case ConnectedAccountProvider.EMAIL_GROUP:
    case ConnectedAccountProvider.APP:
      return undefined;
    default:
      return assertUnreachable(provider);
  }
};
