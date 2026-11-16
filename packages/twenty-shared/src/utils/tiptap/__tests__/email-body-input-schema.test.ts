import { emailBodyInputSchema } from '../email-body-input-schema';

describe('emailBodyInputSchema', () => {
  it('rejects a bare string instead of guessing its format', () => {
    expect(emailBodyInputSchema.safeParse('<p>Hi</p>').success).toBe(false);
  });

  it('rejects an unknown format', () => {
    expect(
      emailBodyInputSchema.safeParse({ type: 'markdown', markdown: '# Hi' })
        .success,
    ).toBe(false);
  });
});
