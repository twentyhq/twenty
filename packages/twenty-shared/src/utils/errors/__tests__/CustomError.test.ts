import { CustomError } from '@/utils/errors/CustomError';

describe('CustomError', () => {
  it('should create an error with a message', () => {
    const error = new CustomError('Something went wrong');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBeUndefined();
  });

  it('should create an error with a message and code', () => {
    const error = new CustomError('Not found', 'NOT_FOUND');

    expect(error.message).toBe('Not found');
    expect(error.code).toBe('NOT_FOUND');
  });
});
