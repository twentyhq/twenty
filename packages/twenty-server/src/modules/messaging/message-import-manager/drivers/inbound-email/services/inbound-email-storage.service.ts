import { Injectable } from '@nestjs/common';

import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

import { InboundEmailS3ClientProvider } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/providers/inbound-email-s3-client.provider';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class InboundEmailStorageService {
  constructor(
    private readonly inboundEmailS3ClientProvider: InboundEmailS3ClientProvider,
  ) {}

  async getRawMessage(s3Key: string): Promise<Buffer> {
    const client = this.inboundEmailS3ClientProvider.getClient();
    const bucket = this.inboundEmailS3ClientProvider.getBucket();

    const response = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: s3Key }),
    );

    if (!isDefined(response.Body)) {
      throw new Error(`S3 object ${s3Key} has no body`);
    }

    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  async deleteRawMessage(s3Key: string): Promise<void> {
    const client = this.inboundEmailS3ClientProvider.getClient();
    const bucket = this.inboundEmailS3ClientProvider.getBucket();

    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: s3Key }));
  }
}
