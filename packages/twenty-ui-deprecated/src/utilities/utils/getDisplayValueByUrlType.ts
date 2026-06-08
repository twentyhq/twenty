import { type LinkType } from '@ui/navigation';
import { isDefined } from 'twenty-shared/utils';

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

  if (type === 'facebook') {
    const matches = href.match(/(?:https?:\/\/)?(?:www.)?facebook.com\/(.+)/);
    if (isDefined(matches?.[1])) {
      return decodeURIComponent(matches?.[1]);
    } else {
      return 'Facebook';
    }
  }
};
