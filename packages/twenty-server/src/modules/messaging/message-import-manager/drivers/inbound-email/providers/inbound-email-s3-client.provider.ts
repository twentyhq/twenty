import { Injectable } from '@nestjs/common';

import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import { isNonEmptyString } from '@sniptt/guards';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { buildAwsRequestHandlerOptions } from 'src/utils/aws-request-handler.util';

@Injectable()
export class InboundEmailS3ClientProvider {
  private s3Client: S3Client | null = null;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getBucket(): string {
    const bucket = this.twentyConfigService.get('STORAGE_S3_NAME');

    if (!isNonEmptyString(bucket)) {
      throw new Error(
        'STORAGE_S3_NAME is not configured; email group requires S3 storage.',
      );
    }

    return bucket;
  }

  getClient(): S3Client {
    if (this.s3Client) {
      return this.s3Client;
    }

    const region = this.twentyConfigService.get('STORAGE_S3_REGION');

    if (!isNonEmptyString(region)) {
      throw new Error('STORAGE_S3_REGION must be set to use email group.');
    }

    const config: S3ClientConfig = {
      region,
      requestHandler: buildAwsRequestHandlerOptions(),
    };

    const endpoint = this.twentyConfigService.get('STORAGE_S3_ENDPOINT');

    if (isNonEmptyString(endpoint)) {
      config.endpoint = endpoint;
    }

    const accessKeyId = this.twentyConfigService.get(
      'STORAGE_S3_ACCESS_KEY_ID',
    );
    const secretAccessKey = this.twentyConfigService.get(
      'STORAGE_S3_SECRET_ACCESS_KEY',
    );

    if (isNonEmptyString(accessKeyId) && isNonEmptyString(secretAccessKey)) {
      config.credentials = { accessKeyId, secretAccessKey };
    }

    this.s3Client = new S3Client(config);

    return this.s3Client;
  }
}
