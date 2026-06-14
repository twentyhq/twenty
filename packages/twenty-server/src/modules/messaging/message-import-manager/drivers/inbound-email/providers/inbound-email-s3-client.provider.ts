import { Injectable } from '@nestjs/common';

import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import { isNonEmptyString } from '@sniptt/guards';

import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces/file-storage.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class InboundEmailS3ClientProvider {
  private s3Client: S3Client | null = null;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  isConfigured(): boolean {
    const storageType = this.twentyConfigService.get('STORAGE_TYPE');
    const domain = this.twentyConfigService.get('INBOUND_EMAIL_DOMAIN');

    return storageType === StorageDriverType.S_3 && isNonEmptyString(domain);
  }

  getBucket(): string {
    const bucket = this.twentyConfigService.get('STORAGE_S3_NAME');

    if (!isNonEmptyString(bucket)) {
      throw new Error(
        'STORAGE_S3_NAME is not configured; email group requires S3 storage.',
      );
    }

    return bucket;
  }

  getDomain(): string {
    const domain = this.twentyConfigService.get('INBOUND_EMAIL_DOMAIN');

    if (!isNonEmptyString(domain)) {
      throw new Error(
        'INBOUND_EMAIL_DOMAIN is not configured; email group is disabled.',
      );
    }

    return domain;
  }

  getClient(): S3Client {
    if (this.s3Client) {
      return this.s3Client;
    }

    const region = this.twentyConfigService.get('STORAGE_S3_REGION');

    if (!isNonEmptyString(region)) {
      throw new Error('STORAGE_S3_REGION must be set to use email group.');
    }

    const config: S3ClientConfig = { region };

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
