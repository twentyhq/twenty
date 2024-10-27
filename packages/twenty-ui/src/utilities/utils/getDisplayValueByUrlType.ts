import { LinkType } from '@ui/navigation/link';
import { isDefined } from '../isDefined';

type getUrlDisplayValueByUrlTypeProps = {
  type: LinkType;
  href: string;
};

export const getDisplayValueByUrlType = ({
  type,
  href,
}: getUrlDisplayValueByUrlTypeProps) => {
  if (type === 'linkedin') {
    const matches = href.match(
      /(?:https?:\/\/)?(?:www.)?linkedin.com\/(?:in|company|school)\/(.*)/,
    );
    if (isDefined(matches?.[1])) {
      return decodeURIComponent(matches?.[1]);
    } else {
      return 'LinkedIn';
    }
  }

  if (type === 'twitter') {
    const matches = href.match(
      /(?:https?:\/\/)?(?:www.)?twitter.com\/([-a-zA-Z0-9@:%_+.~#?&//=]*)/,
    );
    if (isDefined(matches?.[1])) {
      return `@${matches?.[1]}`;
    } else {
      return '@twitter';
    }
  }
};
