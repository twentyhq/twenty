import { ExceptionHandlerUser } from 'src/integrations/exception-handler/interfaces/exception-handler-user.interface';

import { ExceptionHandlerDriverInterface } from 'src/integrations/exception-handler/interfaces';

export class ExceptionHandlerConsoleDriver
  implements ExceptionHandlerDriverInterface
{
  private user: ExceptionHandlerUser | null = null;

  captureException(exception: unknown, user?: ExceptionHandlerUser) {
    console.group('Exception Captured');
    console.info(user);
    console.error(exception);
    console.groupEnd();
  }

  captureMessage(message: string, user?: ExceptionHandlerUser): void {
    console.group('Message Captured');
    console.info(user);
    console.info(message);
    console.groupEnd();
  }
}
