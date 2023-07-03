import { Injectable, Inject } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './s3-storage.module-definition';
import { S3StorageModuleOptions } from './interfaces';
import {
  CreateBucketCommandInput,
  HeadBucketCommandInput,
  NotFound,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageService {
  private s3Client: S3;
  private bucketName: string;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: S3StorageModuleOptions,
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
