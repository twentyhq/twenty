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
  it('should assign the statusCode option when provided', () => {
    const exception = new UnknownException('Not found', 'NOT_FOUND', {
      userFriendlyMessage: msg`Not found`,
      statusCode: 404,
    });

    expect(exception.statusCode).toBe(404);
  });

  it('should leave statusCode undefined when the option is omitted', () => {
    const exception = new UnknownException('Boom', 'INTERNAL_SERVER_ERROR', {
      userFriendlyMessage: msg`Boom`,
    });

    expect(exception.statusCode).toBeUndefined();
  });

  it('should treat an exception as unexpected unless it opts in', () => {
    const exception = new UnknownException('Boom', 'INTERNAL_SERVER_ERROR', {
      userFriendlyMessage: msg`Boom`,
    });

    expect(exception.isExpected).toBe(false);
  });

  it('should mark an exception as expected when the option is provided', () => {
    const exception = new UnknownException('Reconnect', 'INVALID_TOKEN', {
      userFriendlyMessage: msg`Reconnect`,
      isExpected: true,
    });

    expect(exception.isExpected).toBe(true);
  });

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
