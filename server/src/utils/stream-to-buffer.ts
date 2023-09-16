import { Readable } from 'stream';

export const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: any[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};
