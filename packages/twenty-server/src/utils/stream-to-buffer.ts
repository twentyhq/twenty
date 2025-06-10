import { Readable } from 'stream';

export const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chunks: any[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};
