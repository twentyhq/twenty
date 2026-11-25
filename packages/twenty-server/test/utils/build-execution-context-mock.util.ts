import { type ExecutionContext } from '@nestjs/common';

export const buildExecutionContextMock = ({
  type = 'http',
  handler = jest.fn(),
  request,
  response,
  graphqlArguments,
}: {
  type?: string;
  handler?: (...args: never[]) => unknown;
  request?: unknown;
  response?: unknown;
  graphqlArguments?: Record<string, unknown>;
} = {}): ExecutionContext => ({
  getType: jest.fn().mockReturnValue(type),
  getHandler: jest.fn().mockReturnValue(handler),
  getClass: jest.fn(),
  getArgs: jest
    .fn()
    .mockReturnValue([
      undefined,
      graphqlArguments,
      { req: request },
      undefined,
    ]),
  getArgByIndex: jest.fn(),
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue(request),
    getResponse: jest.fn().mockReturnValue(response),
    getNext: jest.fn(),
  }),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
});
