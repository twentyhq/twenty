import { emailSchema } from '@/utils/validation/emailSchema';

describe('emailSchema', () => {
  it('should accept valid emails', () => {
    expect(emailSchema.safeParse('john.doe@example.com').success).toBe(true);
    expect(emailSchema.safeParse('jöhn@example.com').success).toBe(true);
    expect(emailSchema.safeParse('john+tag@sub.example.co').success).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
    expect(emailSchema.safeParse('john@').success).toBe(false);
    expect(emailSchema.safeParse('@example.com').success).toBe(false);
    expect(emailSchema.safeParse('john doe@example.com').success).toBe(false);
  });

  it('should reject emails missing a TLD', () => {
    expect(emailSchema.safeParse('test@example').success).toBe(false);
  });

  it('should reject emails with consecutive dots', () => {
    expect(emailSchema.safeParse('test..test@example.com').success).toBe(false);
  });

  it('should reject emails with a trailing dot in the domain', () => {
    expect(emailSchema.safeParse('test@example.').success).toBe(false);
  });

  it('should reject emails with a leading dot in the local part', () => {
    expect(emailSchema.safeParse('.test@example.com').success).toBe(false);
  });

  it('should reject emails with a dot right before the @', () => {
    expect(emailSchema.safeParse('test.@example.com').success).toBe(false);
  });

  it('should reject emails with a local part longer than 64 characters', () => {
    const longLocalPart = 'a'.repeat(65);

    expect(emailSchema.safeParse(`${longLocalPart}@example.com`).success).toBe(
      false,
    );
    expect(emailSchema.safeParse(`${'a'.repeat(64)}@example.com`).success).toBe(
      true,
    );
  });
});
