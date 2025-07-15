import { safeNewUrl } from "@/utils/safeNewUrl";
import { isDefined } from "@/utils/validation";

export const lowercaseUrlAndRemoveTrailingSlash = (rawUrl: string) => {
  const url = safeNewUrl(rawUrl);

  if (!isDefined(url)) {
    return rawUrl; // should we return null and throw an exception on this ?
  }

  // Only lowercase the origin (protocol + hostname + port) and preserve path case
  const lowercaseOrigin = url.origin.toLowerCase();
  const path = url.pathname + url.search + url.hash;

  return (lowercaseOrigin + path).replace(/\/$/, '');
};
