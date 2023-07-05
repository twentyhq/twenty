import { Injectable, NotFoundException } from '@nestjs/common';
import { S3StorageService } from 'src/integrations/s3-storage/s3-storage.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

@Injectable()
export class FileService {
  constructor(
    private readonly s3Storage: S3StorageService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async getFileStream(folderPath: string, filename: string) {
    const storageType = this.environmentService.getStorageType();

    switch (storageType) {
      case 's3':
        return this.getS3FileStream(folderPath, filename);
      case 'local':
      default:
        return this.getLocalFileStream(folderPath, filename);
    }
  }

  private async getLocalFileStream(folderPath: string, filename: string) {
    const storageLocation = this.environmentService.getStorageLocalPath();

    const filePath = join(
      process.cwd(),
      `${storageLocation}/`,
      folderPath,
      filename,
    );

    return createReadStream(filePath);
  }

  private async getS3FileStream(folderPath: string, filename: string) {
    try {
      const file = await this.s3Storage.getFile({
        Key: `${folderPath}/${filename}`,
      });

      if (!file || !file.Body || !(file.Body instanceof Readable)) {
        throw new Error('Unable to get file stream');
      }

      return Readable.from(file.Body);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
}
