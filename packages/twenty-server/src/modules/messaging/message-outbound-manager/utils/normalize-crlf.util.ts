export const normalizeCrlf = (buffer: Buffer): Buffer => {
  return Buffer.from(buffer.toString('utf8').replace(/\r?\n/g, '\r\n'), 'utf8');
};
