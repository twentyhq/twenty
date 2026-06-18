import {
  nonNegativeAmountStringSchema,
  partnerApplicationRequestSchema,
} from '@/sections/PartnerApplication/partner-application-field-schemas';

const validBody: Record<string, unknown> = {
  name: 'Acme',
  email: 'a@acme.com',
  company: 'Acme Inc',
  website: 'https://acme.com',
  city: 'Paris',
  country: 'FRANCE',
  partnerScope: ['DEVELOPMENT'],
  hourlyRate: 120,
  projectBudgetMin: 5000,
};

describe('partnerApplicationRequestSchema required fields', () => {
  it('accepts a complete body', () => {
    expect(partnerApplicationRequestSchema.safeParse(validBody).success).toBe(
      true,
    );
  });

  it.each(['website', 'city', 'hourlyRate', 'projectBudgetMin'])(
    'rejects a body missing %s',
    (field) => {
      const { [field]: _omitted, ...rest } = validBody;
      expect(partnerApplicationRequestSchema.safeParse(rest).success).toBe(
        false,
      );
    },
  );
});

describe('nonNegativeAmountStringSchema', () => {
  it.each(['0', '120', '12.5', '.5', '12.', '  90  '])(
    'accepts the valid amount %p',
    (value) => {
      expect(nonNegativeAmountStringSchema.safeParse(value).success).toBe(true);
    },
  );

  it.each(['', '.', 'abc', '12abc', '-5', 'NaN', 'Infinity'])(
    'rejects the invalid amount %p',
    (value) => {
      expect(nonNegativeAmountStringSchema.safeParse(value).success).toBe(
        false,
      );
    },
  );
});
