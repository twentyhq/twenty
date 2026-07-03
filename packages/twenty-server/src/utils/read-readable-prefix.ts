import { type Readable } from 'stream';

export const readReadablePrefix = async (
  stream: Readable,
  maxBytes: number,
): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  let collected = 0;
  let settled = false;

  return new Promise((resolve, reject) => {
    const onData = (chunk: Buffer) => {
      if (settled) {
        return;
      }

      chunks.push(chunk);
      collected += chunk.length;

      if (collected >= maxBytes) {
        settled = true;
        stream.off('data', onData);
        stream.off('end', onEnd);
        stream.destroy();
        resolve(Buffer.concat(chunks).subarray(0, maxBytes));
      }
    };

    const onEnd = () => {
      if (settled) {
        return;
      }

      settled = true;
      resolve(Buffer.concat(chunks));
    };

    const onError = (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      reject(error);
    };

    stream.on('data', onData);
    stream.on('end', onEnd);
    stream.on('error', onError);
  });
};
