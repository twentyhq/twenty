import { extractPeopleDataLabsErrorMessage } from '@/people-data-labs/utils/extract-people-data-labs-error-message.util';

describe('extractPeopleDataLabsErrorMessage', () => {
  it('reads the nested People Data Labs error message', () => {
    expect(
      extractPeopleDataLabsErrorMessage({
        json: { error: { message: 'boom' } },
        httpStatus: 500,
      }),
    ).toBe('boom');
  });

  it('joins an array of error messages', () => {
    expect(
      extractPeopleDataLabsErrorMessage({
        json: { message: ['first', 'second'] },
        httpStatus: 400,
      }),
    ).toBe('first; second');
  });

  it('falls back to a generic message when none is present', () => {
    expect(
      extractPeopleDataLabsErrorMessage({ json: {}, httpStatus: 503 }),
    ).toBe('PDL request failed (HTTP 503).');
  });
});
