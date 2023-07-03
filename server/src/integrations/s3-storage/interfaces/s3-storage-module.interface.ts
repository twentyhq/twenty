import { S3ClientConfig } from '@aws-sdk/client-s3';

export interface S3StorageModuleOptions extends S3ClientConfig {
  bucketName: string;
}
