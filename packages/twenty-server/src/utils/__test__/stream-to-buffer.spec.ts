import { PassThrough, Readable } from 'stream';

import { streamToBuffer } from 'src/utils/stream-to-buffer';

describe('streamToBuffer', () => {
  describe('successful scenarios', () => {
    it('should convert a stream with single chunk to buffer', async () => {
      const testData = 'Hello, World!';
      const stream = Readable.from([Buffer.from(testData)]);

      const result = await streamToBuffer(stream);

      expect(result.toString()).toBe(testData);
    });

    it('should convert a stream with multiple chunks to buffer', async () => {
      const chunks = ['Hello, ', 'World', '!'];
      const stream = Readable.from(chunks.map((chunk) => Buffer.from(chunk)));

      const result = await streamToBuffer(stream);

      expect(result.toString()).toBe('Hello, World!');
    });

    it('should handle empty stream', async () => {
      const stream = Readable.from([]);

      const result = await streamToBuffer(stream);

      expect(result.length).toBe(0);
      expect(result.toString()).toBe('');
    });
  });

  describe('error scenarios', () => {
    it('should reject when stream is already ended', async () => {
      const stream = Readable.from([Buffer.from('test')]);

      await streamToBuffer(stream);

      await expect(streamToBuffer(stream)).rejects.toThrow(
        'Stream has already ended',
      );
    });

    it('should reject when stream is not readable (destroyed)', async () => {
      const stream = new PassThrough();

      stream.destroy();

      await expect(streamToBuffer(stream)).rejects.toThrow(
        'Stream is not readable',
      );
    });

    it('should reject when stream emits an error', async () => {
      const stream = new PassThrough();
      const testError = new Error('Stream error');

      const promise = streamToBuffer(stream);

      stream.write(Buffer.from('partial'));
      stream.emit('error', testError);

      await expect(promise).rejects.toThrow('Stream error');
    });

    it('should reject when stream closes before end', async () => {
      const stream = new PassThrough();

      const promise = streamToBuffer(stream);

      stream.write(Buffer.from('data'));
      stream.destroy();

      await expect(promise).rejects.toThrow('Stream closed before end');
    });
  });
});
