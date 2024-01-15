import { ExceptionHandlerUser } from './exception-handler-user.interface';

export interface ExceptionHandlerDriverInterface {
  captureException(exception: unknown, user?: ExceptionHandlerUser): void;
  captureMessage(message: string, user?: ExceptionHandlerUser): void;
}
