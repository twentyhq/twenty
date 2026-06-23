import { type LinkType } from '@ui/navigation/SocialLink/LinkType';
import { SOCIAL_LINK_PROVIDERS } from '@ui/navigation/SocialLink/socialLinkProviders';
import { isDefined } from '@ui/utilities/utils/isDefined';

type GetDisplayValueByUrlTypeProps = {
  type: LinkType;
  href: string;
};

export const getDisplayValueByUrlType = ({
  type,
  href,
}: GetDisplayValueByUrlTypeProps) => {
  const provider = SOCIAL_LINK_PROVIDERS.find(
    (socialLinkProvider) => socialLinkProvider.type === type,
  );

  if (!isDefined(provider)) {
    return undefined;
  }

  const handle = href.match(provider.handlePattern)?.[1];

  if (
    !isDefined(handle) ||
    provider.reservedPaths.includes(handle.toLowerCase())
  ) {
    return provider.fallbackLabel;
  }

  return `${provider.handlePrefix}${decodeURIComponent(handle)}`;
};
