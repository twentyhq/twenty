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
    const receivedSignatureHex = match[2];

    // Build the HMAC input as raw bytes: timestamp + ':' + rawBody
    const timestampBytes = Buffer.from(`${timestamp}:`, 'utf-8');
    const hmacInput = Buffer.concat([timestampBytes, args.rawBody]);

    const expectedSignature = createHmac('sha256', args.secret)
      .update(hmacInput)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = Buffer.from(receivedSignatureHex, 'hex');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
}
