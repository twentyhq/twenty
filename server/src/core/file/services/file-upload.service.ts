import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { S3StorageService } from 'src/integrations/s3-storage/s3-storage.service';
import { kebabCase } from 'src/utils/kebab-case';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { LocalStorageService } from 'src/integrations/local-storage/local-storage.service';
import { getCropSize } from 'src/utils/image';
import { settings } from 'src/constants/settings';
import { FileFolder } from '../interfaces/file-folder.interface';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly s3Storage: S3StorageService,
    private readonly localStorage: LocalStorageService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async uploadFile({
    file,
    name,
    mimeType,
    fileFolder,
  }: {
    file: Buffer | Uint8Array | string;
    name: string;
    mimeType: string | undefined;
    fileFolder: FileFolder;
  }) {
    const storageType = this.environmentService.getStorageType();

    switch (storageType) {
      case 's3': {
        await this.uploadFileToS3(file, name, mimeType, fileFolder);
        return {
          name: `/${name}`,
        };
      }
      case 'local':
      default: {
        await this.uploadToLocal(file, name, fileFolder);
        return {
          name: `/${name}`,
        };
      }
    }
  }

  async uploadImage({
    file,
    name,
    mimeType,
    fileFolder,
  }: {
    file: Buffer | Uint8Array | string;
    name: string;
    mimeType: string | undefined;
    fileFolder: FileFolder;
  }) {
    // Get all cropSizes for this fileFolder
    const cropSizes = settings.storage.imageCropSizes[fileFolder];
    // Extract the values from ShortCropSize
    const sizes = cropSizes.map((shortSize) => getCropSize(shortSize));
    // Crop images based on sizes
    const images = await Promise.all(
      sizes.map((size) =>
        sharp(file).resize({
          [size?.type || 'width']: size?.value ?? undefined,
        }),
      ),
    );

    // Upload all images to corresponding folders
    await Promise.all(
      images.map(async (image, index) => {
        const buffer = await image.toBuffer();

        return this.uploadFile({
          file: buffer,
          name: `${cropSizes[index]}/${name}`,
          mimeType,
          fileFolder,
        });
      }),
    );

    return {
      name: `/${name}`,
    };
  }

  private async uploadToLocal(
    file: Buffer | Uint8Array | string,
    name: string,
    fileFolder: FileFolder,
  ): Promise<void> {
    const folderName = kebabCase(fileFolder.toString());

    try {
      const result = await this.localStorage.uploadFile({
        file,
        name,
        folder: folderName,
      });

      return result;
    } catch (err) {
      console.log('uploadFile error: ', err);
      throw err;
    }
  }

  private async uploadFileToS3(
    file: Buffer | Uint8Array | string,
    name: string,
    mimeType: string | undefined,
    fileFolder: FileFolder,
  ) {
    // Aws only accept bucket with kebab-case name
    const bucketFolderName = kebabCase(fileFolder.toString());

    try {
      const result = await this.s3Storage.uploadFile({
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
