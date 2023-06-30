import { Injectable } from '@nestjs/common';
import { AwsS3Service } from 'src/integrations/aws-s3/aws-s3.service';
import { FileFolder } from './interfaces/file-folder.interface';
import { kebabCase } from 'src/utils/kebab-case';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(
    file: File,
    name: string,
    mimeType: string | undefined,
    bucketFolder: FileFolder,
  ) {
    const fileSystem = this.configService.get<string>('FILESYSTEM_DISK');

    switch (fileSystem) {
      case 's3':
        return this.uploadFileToS3(file, name, mimeType, bucketFolder);
      case 'local':
        break;
    }
  }

  private async uploadFileToS3(
    file: File,
    name: string,
    mimeType: string | undefined,
    bucketFolder: FileFolder,
  ) {
    const bucketFolderName = kebabCase(bucketFolder.toString());

    try {
      const result = await this.awsS3Service.uploadFile({
        Key: `${bucketFolderName}/${name}`,
        Body: file,
        ContentType: mimeType,
      });

      return result;
    } catch (err) {
      console.log('uploadFile error: ', err);
      throw err;
    }
  }
}
