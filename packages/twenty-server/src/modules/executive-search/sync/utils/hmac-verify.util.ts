import { createHmac, timingSafeEqual } from 'crypto';

export function verifyHmacSignature(args: {
  rawBody: Buffer;
  signatureHeader: string;
  secret: string;
}): boolean {
  try {
    const match = args.signatureHeader.match(/^t=([^,]+),v1=([a-f0-9]+)$/i);

    if (!match) {
      return false;
    }

    const timestamp = match[1];
    const receivedSignature = match[2];

    const expectedSignature = createHmac('sha256', args.secret)
      .update(`${timestamp}:${args.rawBody}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuffer = Buffer.from(receivedSignature, 'utf-8');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
}
