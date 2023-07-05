import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { getCropSize } from 'src/utils/image';
import { settings } from 'src/constants/settings';
import { FileFolder } from '../interfaces/file-folder.interface';
import { FileStorageService } from 'src/integrations/file-storage/file-storage.service';

@Injectable()
export class FileUploadService {
  constructor(private readonly fileStorage: FileStorageService) {}

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
    await this.fileStorage.write({
      file,
      name,
      mimeType,
      folder: fileFolder,
    });

    return {
      name: `/${name}`,
    };
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
}
