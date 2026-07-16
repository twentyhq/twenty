import crypto from 'crypto';

import { Injectable } from '@nestjs/common';

@Injectable()
export class OutboundHmacSignerService {
  sign(payload: Record<string, unknown>, secret: string): {
    signature: string;
    timestamp: string;
    nonce: string;
    body: string;
  } {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const body = JSON.stringify(payload);

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}:${nonce}:${body}`)
      .digest('hex');

    return { signature, timestamp, nonce, body };
  }

  toHeaders(
    result: ReturnType<typeof this.sign>,
  ): Record<string, string> {
    return {
      'X-Twenty-Directus-Signature': result.signature,
      'X-Twenty-Directus-Timestamp': result.timestamp,
      'X-Twenty-Directus-Nonce': result.nonce,
      'Content-Type': 'application/json',
    };
  }
}
