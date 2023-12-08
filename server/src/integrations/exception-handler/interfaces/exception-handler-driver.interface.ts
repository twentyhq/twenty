export interface ExceptionHandlerDriverInterface {
  captureException(exception: unknown): void;
  captureMessage(message: string): void;
}
