export interface ExceptionCapturerDriverInterface {
  captureException(exception: unknown): void;
}
