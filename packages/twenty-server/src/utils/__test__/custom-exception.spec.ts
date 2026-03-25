import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
  UnknownException,
} from 'src/utils/custom-exception';

describe('appendCommonExceptionCode', () => {
  it('should merge CommonExceptionCode with specific exception code', () => {
    const specificExceptionCode = {
      SPECIFIC_ERROR: 'SPECIFIC_ERROR',
    };

    const result = appendCommonExceptionCode(specificExceptionCode);

    expect(result).toEqual({
      INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
      SPECIFIC_ERROR: 'SPECIFIC_ERROR',
    });
  });

  it('should return CommonExceptionCode when empty object is provided', () => {
    const result = appendCommonExceptionCode({});

    expect(result).toEqual({
      INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    });
  });
});

describe('CustomException', () => {
  class TestException extends CustomException<string> {
    constructor(
      message: string,
      code: string,
      { userFriendlyMessage }: { userFriendlyMessage: MessageDescriptor },
    ) {
      super(message, code, { userFriendlyMessage });
    }
  }

  it('should set message and code correctly', () => {
    const message = 'Test error message';
    const code = 'TEST_ERROR';
    const userFriendlyMessage = msg`Test user friendly message`;
    const exception = new TestException(message, code, { userFriendlyMessage });

    expect(exception.message).toBe(message);
    expect(exception.code).toBe(code);
    expect(exception.userFriendlyMessage).toBe(userFriendlyMessage);
  });

  it('should set userFriendlyMessage when provided', () => {
    const message = 'Test error message';
    const code = 'TEST_ERROR';
    const userFriendlyMessage = msg`User friendly error message`;
    const exception = new TestException(message, code, {
      userFriendlyMessage,
    });

    expect(exception.message).toBe(message);
    expect(exception.code).toBe(code);
    expect(exception.userFriendlyMessage).toBe(userFriendlyMessage);
  });

  it('should extend Error', () => {
    const exception = new TestException('Test error', 'TEST_ERROR', {
      userFriendlyMessage: msg`Test error`,
    });

    expect(exception).toBeInstanceOf(Error);
  });
});

describe('UnknownException', () => {
  it('should extend CustomException', () => {
    const exception = new UnknownException('Test error', 'TEST_ERROR', {
      userFriendlyMessage: msg`Test error`,
    });

    expect(exception).toBeInstanceOf(CustomException);
  });

  it('should set message and code correctly', () => {
    const message = 'Test error message';
    const code = 'TEST_ERROR';
    const exception = new UnknownException(message, code, {
      userFriendlyMessage: msg`Test error`,
    });

    expect(exception.message).toBe(message);
    expect(exception.code).toBe(code);
  });

  it('should set userFriendlyMessage when provided', () => {
    const message = 'Test error message';
    const code = 'TEST_ERROR';
    const userFriendlyMessage = msg`User friendly error message`;
    const exception = new UnknownException(message, code, {
      userFriendlyMessage,
    });

    expect(exception.message).toBe(message);
    expect(exception.code).toBe(code);
    expect(exception.userFriendlyMessage).toBe(userFriendlyMessage);
  });
});
