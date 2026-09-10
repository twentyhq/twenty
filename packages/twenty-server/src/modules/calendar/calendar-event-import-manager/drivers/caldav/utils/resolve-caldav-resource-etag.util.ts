import { isNonEmptyString } from '@sniptt/guards';

type ResolveCalDavResourceEtagArgs = {
  etag: unknown;
  lastModified: unknown;
  ctag: string | undefined;
  href: string;
};

export const resolveCalDavResourceEtag = ({
  etag,
  lastModified,
  ctag,
  href,
}: ResolveCalDavResourceEtagArgs): string => {
  if (isNonEmptyString(etag)) {
    return etag;
  }

  if (isNonEmptyString(lastModified)) {
    return lastModified;
  }

  if (isNonEmptyString(ctag)) {
    return `${href}:${ctag}`;
  }

  return href;
};
