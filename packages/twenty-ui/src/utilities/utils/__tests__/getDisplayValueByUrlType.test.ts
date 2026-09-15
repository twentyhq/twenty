import { LinkType } from '@ui/navigation/SocialLink/LinkType';

import { getDisplayValueByUrlType } from '../getDisplayValueByUrlType';

describe('getDisplayValueByUrlType', () => {
  describe('linkedin', () => {
    it('should extract username from LinkedIn profile URL', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.LinkedIn,
        href: 'https://www.linkedin.com/in/johndoe',
      });
      expect(result).toBe('johndoe');
    });

    it('should extract company name from LinkedIn company URL', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.LinkedIn,
        href: 'https://www.linkedin.com/company/acme-corp',
      });
      expect(result).toBe('acme-corp');
    });

    it('should extract school name from LinkedIn school URL', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.LinkedIn,
        href: 'https://www.linkedin.com/school/mit',
      });
      expect(result).toBe('mit');
    });

    it('should handle LinkedIn URL without protocol', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.LinkedIn,
        href: 'linkedin.com/in/johndoe',
      });
      expect(result).toBe('johndoe');
    });

    it('should handle LinkedIn URL without www', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.LinkedIn,
        href: 'https://linkedin.com/in/johndoe',
      });
      expect(result).toBe('johndoe');
    });

    it('should decode URL-encoded characters in LinkedIn username', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.LinkedIn,
        href: 'https://www.linkedin.com/in/john%20doe',
      });
      expect(result).toBe('john doe');
    });

    it('should return "LinkedIn" for invalid LinkedIn URLs', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.LinkedIn,
        href: 'https://www.linkedin.com/feed',
      });
      expect(result).toBe('LinkedIn');
    });
  });

  describe('twitter', () => {
    it('should extract username from Twitter URL with @ prefix', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Twitter,
        href: 'https://www.twitter.com/johndoe',
      });
      expect(result).toBe('@johndoe');
    });

    it('should handle Twitter URL without protocol', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Twitter,
        href: 'twitter.com/johndoe',
      });
      expect(result).toBe('@johndoe');
    });

    it('should handle Twitter URL without www', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Twitter,
        href: 'https://twitter.com/johndoe',
      });
      expect(result).toBe('@johndoe');
    });

    it('should return "Twitter" when no username can be extracted', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Twitter,
        href: 'https://www.twitter.com',
      });
      expect(result).toBe('Twitter');
    });

    it('should return "Twitter" for a reserved app route', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Twitter,
        href: 'https://x.com/home',
      });
      expect(result).toBe('Twitter');
    });
  });

  describe('facebook', () => {
    it('should extract username from Facebook profile URL', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Facebook,
        href: 'https://www.facebook.com/johndoe',
      });
      expect(result).toBe('johndoe');
    });

    it('should handle Facebook URL without protocol', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Facebook,
        href: 'facebook.com/johndoe',
      });
      expect(result).toBe('johndoe');
    });

    it('should handle Facebook URL without www', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Facebook,
        href: 'https://facebook.com/johndoe',
      });
      expect(result).toBe('johndoe');
    });

    it('should decode URL-encoded characters in Facebook username', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Facebook,
        href: 'https://www.facebook.com/john%20doe',
      });
      expect(result).toBe('john doe');
    });

    it('should return "Facebook" for invalid Facebook URLs', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Facebook,
        href: 'https://www.facebook.com/',
      });
      expect(result).toBe('Facebook');
    });
  });

  describe('instagram', () => {
    it('should extract handle from Instagram profile URL with @ prefix', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Instagram,
        href: 'https://www.instagram.com/ptcrash',
      });
      expect(result).toBe('@ptcrash');
    });

    it('should handle Instagram URL without protocol', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Instagram,
        href: 'instagram.com/ptcrash',
      });
      expect(result).toBe('@ptcrash');
    });

    it('should handle Instagram URL without www', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Instagram,
        href: 'https://instagram.com/ptcrash',
      });
      expect(result).toBe('@ptcrash');
    });

    it('should ignore a trailing slash', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Instagram,
        href: 'https://instagram.com/ptcrash/',
      });
      expect(result).toBe('@ptcrash');
    });

    it('should ignore a query string', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Instagram,
        href: 'https://instagram.com/ptcrash?hl=en',
      });
      expect(result).toBe('@ptcrash');
    });

    it('should decode URL-encoded characters in the handle', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Instagram,
        href: 'https://instagram.com/john%20doe',
      });
      expect(result).toBe('@john doe');
    });

    it('should return "Instagram" for a post URL', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Instagram,
        href: 'https://instagram.com/p/ABC123',
      });
      expect(result).toBe('Instagram');
    });

    it('should return "Instagram" for a reel URL', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Instagram,
        href: 'https://instagram.com/reel/xyz',
      });
      expect(result).toBe('Instagram');
    });

    it('should return "Instagram" when no handle can be extracted', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Instagram,
        href: 'https://www.instagram.com/',
      });
      expect(result).toBe('Instagram');
    });
  });

  describe('x', () => {
    it('should extract handle from an x.com URL as a Twitter type', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Twitter,
        href: 'https://x.com/johndoe',
      });
      expect(result).toBe('@johndoe');
    });

    it('should handle an x.com URL without protocol', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Twitter,
        href: 'x.com/johndoe',
      });
      expect(result).toBe('@johndoe');
    });

    it('should ignore the path segments of a tweet permalink', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Twitter,
        href: 'https://x.com/johndoe/status/123456',
      });
      expect(result).toBe('@johndoe');
    });

    it('should ignore a query string', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Twitter,
        href: 'https://x.com/johndoe?lang=en',
      });
      expect(result).toBe('@johndoe');
    });
  });

  describe('tiktok', () => {
    it('should extract handle from a TikTok profile URL', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.TikTok,
        href: 'https://www.tiktok.com/@johndoe',
      });
      expect(result).toBe('@johndoe');
    });

    it('should handle a TikTok URL without protocol or www', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.TikTok,
        href: 'tiktok.com/@johndoe',
      });
      expect(result).toBe('@johndoe');
    });

    it('should ignore a trailing path segment', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.TikTok,
        href: 'https://www.tiktok.com/@johndoe/video/123',
      });
      expect(result).toBe('@johndoe');
    });

    it('should return "TikTok" when no handle can be extracted', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.TikTok,
        href: 'https://www.tiktok.com/',
      });
      expect(result).toBe('TikTok');
    });
  });

  describe('bluesky', () => {
    it('should extract handle from a Bluesky profile URL', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Bluesky,
        href: 'https://bsky.app/profile/johndoe.bsky.social',
      });
      expect(result).toBe('johndoe.bsky.social');
    });

    it('should handle a Bluesky URL without protocol', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Bluesky,
        href: 'bsky.app/profile/johndoe.bsky.social',
      });
      expect(result).toBe('johndoe.bsky.social');
    });

    it('should return "Bluesky" when no handle can be extracted', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Bluesky,
        href: 'https://bsky.app/profile/',
      });
      expect(result).toBe('Bluesky');
    });
  });

  describe('url type', () => {
    it('should return undefined for generic url type', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Url,
        href: 'https://example.com',
      });
      expect(result).toBeUndefined();
    });
  });
});
