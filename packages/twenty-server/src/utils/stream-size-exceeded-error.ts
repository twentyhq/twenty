// Callers that cap a read need to tell "too big" apart from a storage failure
// without matching on a message, so they can map it to their own domain error.
export class StreamSizeExceededError extends Error {
  constructor(maxSizeBytes: number) {
    super(`Stream exceeds maximum allowed size of ${maxSizeBytes} bytes`);
    this.name = 'StreamSizeExceededError';
  }
}
