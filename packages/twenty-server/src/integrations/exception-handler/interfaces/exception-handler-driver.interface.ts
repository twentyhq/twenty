import { ExceptionHandlerOptions } from './exception-handler-options.interface';
import { ExceptionHandlerUser } from './exception-handler-user.interface';

export interface ExceptionHandlerDriverInterface {
  captureExceptions(
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ): string[];
  captureMessage(message: string, user?: ExceptionHandlerUser): void;
}
