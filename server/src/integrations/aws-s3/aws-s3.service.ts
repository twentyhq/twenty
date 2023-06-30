import { Injectable, Inject } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './aws-s3.module-definition';
import { AwsS3ModuleOptions } from './interfaces';
import {
  CreateBucketCommandInput,
  HeadBucketCommandInput,
  NotFound,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsS3Service {
  private s3Client: S3;
  private bucketName: string;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: AwsS3ModuleOptions,
  ) {
    const { bucketName, ...s3Options } = options;

    this.s3Client = new S3(s3Options);
    this.bucketName = bucketName;
  }

  public get client(): S3 {
    return this.s3Client;
  }

  async uploadFile(
    params: Omit<PutObjectCommandInput, 'Bucket'>,
  ): Promise<PutObjectCommandOutput> {
    const command = new PutObjectCommand({
      ...params,
      Bucket: this.bucketName,
    });

    await this.createBucket({ Bucket: this.bucketName });

    return this.s3Client.send(command);
  }

  async checkBucketExists(args: HeadBucketCommandInput) {
    try {
      await this.s3Client.headBucket(args);

      return true;
    } catch (error) {
      if (error instanceof NotFound) {
        return false;
      }

      throw error;
    }
  }

  async createBucket(args: CreateBucketCommandInput) {
    const exist = await this.checkBucketExists({
      Bucket: args.Bucket,
    });

    if (exist) {
      return;
    }

    return this.s3Client.createBucket(args);
  }
}
