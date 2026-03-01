import { isWorkEmail, isWorkDomain } from 'src/utils/is-work-email';

describe('isWorkEmail', () => {
  it('should return true for a work email', () => {
    expect(isWorkEmail('user@company.com')).toBe(true);
  });

  it('should return false for a personal email', () => {
    expect(isWorkEmail('user@gmail.com')).toBe(false);
  });

  it('should return false for an empty email string', () => {
    expect(isWorkEmail('')).toBe(false);
  });

  it('should return false for an email with undefined domain', () => {
    // Assuming getDomainNameByEmail(email) returns undefined if no domain.
    expect(isWorkEmail('user@')).toBe(false);
  });

  it('should return false for an invalid email format', () => {
    expect(isWorkEmail('invalid-email')).toBe(false);
  });

  // T-01: AC-001 - Uppercase non-work domain should return false
  it('should return false for uppercase non-work email (AC-001)', () => {
    expect(isWorkEmail('user@GMAIL.COM')).toBe(false);
  });

  // T-02: AC-002 - Mixed-case non-work domain should return false
  it('should return false for mixed-case non-work email (AC-002)', () => {
    expect(isWorkEmail('user@GmAiL.CoM')).toBe(false);
  });

  // T-05: AC-005 - Mixed-case work domain should return true
  it('should return true for mixed-case work email (AC-005)', () => {
    expect(isWorkEmail('user@MyCompany.COM')).toBe(true);
  });

  // T-06: Regression - Existing lowercase tests still pass
  it('should still return false for lowercase personal email (Regression)', () => {
    expect(isWorkEmail('user@gmail.com')).toBe(false);
  });

  // T-07: Regression - Existing work email tests still pass
  it('should still return true for lowercase work email (Regression)', () => {
    expect(isWorkEmail('user@mycompany.com')).toBe(true);
  });
});

describe('isWorkDomain', () => {
  // T-03: AC-003 - Uppercase non-work domain should return false
  it('should return false for uppercase non-work domain (AC-003)', () => {
    expect(isWorkDomain('GMAIL.COM')).toBe(false);
  });

  // T-04: AC-004 - Mixed-case non-work domain should return false
  it('should return false for mixed-case non-work domain (AC-004)', () => {
    expect(isWorkDomain('Yahoo.Com')).toBe(false);
  });

  // T-05 variant: Mixed-case work domain should return true
  it('should return true for mixed-case work domain', () => {
    expect(isWorkDomain('MyCompany.COM')).toBe(true);
  });
});
