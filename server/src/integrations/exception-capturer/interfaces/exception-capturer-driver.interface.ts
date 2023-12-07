export interface ExceptionCapturerDriverInterface {
  captureException(exception: unknown): void;
  captureMessage(message: string): void;
}
