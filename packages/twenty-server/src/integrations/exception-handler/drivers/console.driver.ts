import { ExceptionHandlerDriverInterface } from 'src/integrations/exception-handler/interfaces';

export class ExceptionHandlerConsoleDriver
  implements ExceptionHandlerDriverInterface
{
  captureException(exception: unknown) {
    console.group('Exception Captured');
    console.error(exception);
    console.groupEnd();
  }

  captureMessage(message: string): void {
    console.group('Message Captured');
    console.info(message);
    console.groupEnd();
  }
}
