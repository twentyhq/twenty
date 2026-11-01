import { generateInputSchema } from '@/application/generateInputSchema';

describe('generateInputSchema', () => {
  it('takes the nulls the GraphQL input sends for a message without attachments or filename', () => {
    const parsed = generateInputSchema.parse({
      input: [
        { role: 'user', content: 'Qualify Acme', attachments: null },
        {
          role: 'user',
          content: '',
          attachments: [{ fileId: 'file-id', filename: null }],
        },
      ],
    });

    expect(parsed.input).toEqual([
      { role: 'user', content: 'Qualify Acme', attachments: undefined },
      {
        role: 'user',
        content: '',
        attachments: [{ fileId: 'file-id', filename: undefined }],
      },
    ]);
  });

  it('still refuses a message with neither content nor attachments', () => {
    expect(
      generateInputSchema.safeParse({
        input: [{ role: 'user', content: ' ', attachments: null }],
      }).success,
    ).toBe(false);
  });
});
