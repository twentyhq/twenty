import { LinkType } from '@ui/navigation/link/components/SocialLink';

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

    it('should return "@twitter" when no username can be extracted', () => {
      const result = getDisplayValueByUrlType({
        type: LinkType.Twitter,
        href: 'https://www.twitter.com',
      });
      expect(result).toBe('@twitter');
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
