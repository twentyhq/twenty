import { LinkType } from '@ui/navigation/SocialLink/LinkType';

export type SocialLinkProvider = {
  type: LinkType;
  detectPattern: RegExp;
  handlePattern: RegExp;
  reservedPaths: string[];
  handlePrefix: string;
  fallbackLabel: string;
};

export const SOCIAL_LINK_PROVIDERS: SocialLinkProvider[] = [
  {
    type: LinkType.LinkedIn,
    detectPattern: /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/.+$/,
    handlePattern:
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company|school)\/([^/?#]+)/,
    reservedPaths: [],
    handlePrefix: '',
    fallbackLabel: 'LinkedIn',
  },
  {
    type: LinkType.Twitter,
    detectPattern: /^(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/.+$/,
    handlePattern: /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([^/?#]+)/,
    reservedPaths: [
      'home',
      'explore',
      'notifications',
      'messages',
      'settings',
      'search',
      'i',
      'intent',
    ],
    handlePrefix: '@',
    fallbackLabel: 'Twitter',
  },
  {
    type: LinkType.Facebook,
    detectPattern: /^(?:https?:\/\/)?(?:www\.)?facebook\.com\/.+$/,
    handlePattern: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^/?#]+)/,
    reservedPaths: [],
    handlePrefix: '',
    fallbackLabel: 'Facebook',
  },
  {
    type: LinkType.Instagram,
    detectPattern: /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/.+$/,
    handlePattern: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#]+)/,
    reservedPaths: [
      'p',
      'reel',
      'reels',
      'explore',
      'stories',
      'tv',
      'accounts',
      'about',
    ],
    handlePrefix: '@',
    fallbackLabel: 'Instagram',
  },
  {
    type: LinkType.TikTok,
    detectPattern: /^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@.+$/,
    handlePattern: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^/?#]+)/,
    reservedPaths: [],
    handlePrefix: '@',
    fallbackLabel: 'TikTok',
  },
  {
    type: LinkType.Bluesky,
    detectPattern: /^(?:https?:\/\/)?(?:www\.)?bsky\.app\/profile\/.+$/,
    handlePattern: /(?:https?:\/\/)?(?:www\.)?bsky\.app\/profile\/([^/?#]+)/,
    reservedPaths: [],
    handlePrefix: '',
    fallbackLabel: 'Bluesky',
  },
];
