import { type Readable } from 'stream';

export const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    // Check if stream is already ended
    if (stream.readableEnded) {
      resolve(Buffer.concat([]));
      return;
    }

    // Check if stream is not readable (destroyed or closed)
    if (!stream.readable) {
      resolve(Buffer.concat([]));
      return;
    }

    let isResolved = false;

    const cleanup = () => {
      stream.removeListener('data', onData);
      stream.removeListener('end', onEnd);
      stream.removeListener('error', onError);
      stream.removeListener('close', onClose);
    };

    const onData = (chunk: Buffer) => {
      if (!isResolved) {
        chunks.push(chunk);
      }
    };

    const onEnd = () => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolve(Buffer.concat(chunks));
      }
    };

    const onError = (error: Error) => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        reject(error);
      }
    };

    const onClose = () => {
      if (!isResolved && !stream.readableEnded) {
        isResolved = true;
        cleanup();
        reject(new Error('Stream closed before end'));
      }
    };

    stream.on('data', onData);
    stream.on('end', onEnd);
    stream.on('error', onError);
    stream.on('close', onClose);
  });
};
