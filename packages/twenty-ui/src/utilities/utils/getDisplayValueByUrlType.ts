import { type LinkType } from '@ui/navigation';
import { isDefined } from '@ui/utilities/utils/isDefined';

// Instagram path segments that are app routes, not user handles
const INSTAGRAM_RESERVED_PATHS = [
  'p',
  'reel',
  'reels',
  'explore',
  'stories',
  'tv',
  'accounts',
  'about',
];

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

  if (type === 'instagram') {
    const matches = href.match(
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#]+)/,
    );
    const handle = matches?.[1];
    if (
      isDefined(handle) &&
      !INSTAGRAM_RESERVED_PATHS.includes(handle.toLowerCase())
    ) {
      return `@${decodeURIComponent(handle)}`;
    } else {
      return 'Instagram';
    }
  }
};
