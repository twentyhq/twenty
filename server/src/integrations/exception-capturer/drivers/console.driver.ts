import { ExceptionCapturerDriverInterface } from 'src/integrations/exception-capturer/interfaces';

export class ExceptionCapturerConsoleDriver
  implements ExceptionCapturerDriverInterface
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
