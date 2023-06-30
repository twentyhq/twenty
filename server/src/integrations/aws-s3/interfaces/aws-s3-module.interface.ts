import { S3ClientConfig } from '@aws-sdk/client-s3';

export interface AwsS3ModuleOptions extends S3ClientConfig {
  bucketName: string;
}
