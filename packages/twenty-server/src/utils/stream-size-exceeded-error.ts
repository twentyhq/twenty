// Lets callers tell "too big" from a storage failure without matching on a message
export class StreamSizeExceededError extends Error {
  constructor(maxSizeBytes: number) {
    super(`Stream exceeds maximum allowed size of ${maxSizeBytes} bytes`);
    this.name = 'StreamSizeExceededError';
  }
}
