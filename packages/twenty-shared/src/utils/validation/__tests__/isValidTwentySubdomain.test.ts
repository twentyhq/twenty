import { isValidTwentySubdomain } from '@/utils/validation/isValidTwentySubdomain';

describe('isValidTwentySubdomain', () => {
  describe('valid subdomains', () => {
    it('should accept standard alphanumeric subdomains', () => {
      expect(isValidTwentySubdomain('abc')).toBe(true);
      expect(isValidTwentySubdomain('test123')).toBe(true);
      expect(isValidTwentySubdomain('company1')).toBe(true);
      expect(isValidTwentySubdomain('workspace2024')).toBe(true);
    });

    it('should accept subdomains with hyphens in the middle', () => {
      expect(isValidTwentySubdomain('my-company')).toBe(true);
      expect(isValidTwentySubdomain('test-workspace')).toBe(true);
      expect(isValidTwentySubdomain('multi-word-subdomain')).toBe(true);
      expect(isValidTwentySubdomain('a-b-c-d-e')).toBe(true);
    });

    it('should accept minimum length subdomains (3 characters)', () => {
      expect(isValidTwentySubdomain('abc')).toBe(true);
      expect(isValidTwentySubdomain('a1b')).toBe(true);
      expect(isValidTwentySubdomain('a-b')).toBe(true);
    });

    it('should accept maximum length subdomains (30 characters)', () => {
      const exactly30 = 'a' + 'b'.repeat(28) + 'c';

      expect(exactly30.length).toBe(30);
      expect(isValidTwentySubdomain(exactly30)).toBe(true);
    });

    it('should accept numeric-only subdomains', () => {
      expect(isValidTwentySubdomain('123')).toBe(true);
      expect(isValidTwentySubdomain('456789')).toBe(true);
      expect(isValidTwentySubdomain('1-2-3')).toBe(true);
    });
  });

  describe('invalid subdomains', () => {
    it('should reject empty strings', () => {
      expect(isValidTwentySubdomain('')).toBe(false);
    });

    it('should reject subdomains shorter than 3 characters', () => {
      expect(isValidTwentySubdomain('a')).toBe(false);
      expect(isValidTwentySubdomain('ab')).toBe(false);
    });

    it('should reject subdomains longer than 30 characters', () => {
      const tooLong = 'a'.repeat(31);

      expect(isValidTwentySubdomain(tooLong)).toBe(false);
    });

    it('should reject subdomains starting with a hyphen', () => {
      expect(isValidTwentySubdomain('-test')).toBe(false);
      expect(isValidTwentySubdomain('-abc')).toBe(false);
    });

    it('should reject subdomains ending with a hyphen', () => {
      expect(isValidTwentySubdomain('test-')).toBe(false);
      expect(isValidTwentySubdomain('abc-')).toBe(false);
    });

    it('should reject subdomains with uppercase letters', () => {
      expect(isValidTwentySubdomain('Test')).toBe(false);
      expect(isValidTwentySubdomain('MyCompany')).toBe(false);
      expect(isValidTwentySubdomain('WORKSPACE')).toBe(false);
    });

    it('should reject subdomains with special characters', () => {
      expect(isValidTwentySubdomain('test@company')).toBe(false);
      expect(isValidTwentySubdomain('my_workspace')).toBe(false);
      expect(isValidTwentySubdomain('test.company')).toBe(false);
      expect(isValidTwentySubdomain('workspace#1')).toBe(false);
    });

    it('should reject subdomains with spaces', () => {
      expect(isValidTwentySubdomain('test company')).toBe(false);
      expect(isValidTwentySubdomain(' test')).toBe(false);
      expect(isValidTwentySubdomain('test ')).toBe(false);
    });

    it('should reject subdomains starting with "api-"', () => {
      expect(isValidTwentySubdomain('api-test')).toBe(false);
      expect(isValidTwentySubdomain('api-company')).toBe(false);
      expect(isValidTwentySubdomain('api-123')).toBe(false);
    });

    it('should accept subdomains containing "api" not as prefix', () => {
      expect(isValidTwentySubdomain('myapi')).toBe(true);
      expect(isValidTwentySubdomain('rapid')).toBe(true);
    });

    it('should reject subdomains with only hyphens', () => {
      expect(isValidTwentySubdomain('---')).toBe(false);
      expect(isValidTwentySubdomain('----')).toBe(false);
    });

    it('should reject whitespace-only strings', () => {
      expect(isValidTwentySubdomain('   ')).toBe(false);
      expect(isValidTwentySubdomain('\t')).toBe(false);
      expect(isValidTwentySubdomain('\n')).toBe(false);
    });

    it('should reject unicode characters', () => {
      expect(isValidTwentySubdomain('café')).toBe(false);
      expect(isValidTwentySubdomain('tëst')).toBe(false);
    });
  });
});
