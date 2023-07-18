import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { getCropSize } from 'src/utils/image';
import { settings } from 'src/constants/settings';
import { FileFolder } from '../interfaces/file-folder.interface';
import { FileStorageService } from 'src/integrations/file-storage/file-storage.service';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class FileUploadService {
  constructor(private readonly fileStorage: FileStorageService) {}

  private async _uploadFile({
    file,
    filename,
    mimeType,
    fileFolder,
  }: {
    file: Buffer | Uint8Array | string;
    filename: string;
    mimeType: string | undefined;
    fileFolder: FileFolder;
  }) {
    await this.fileStorage.write({
      file,
      name: filename,
      mimeType,
      folder: fileFolder,
    });
  }

  async uploadFile({
    file,
    filename,
    mimeType,
    fileFolder,
  }: {
    file: Buffer | Uint8Array | string;
    filename: string;
    mimeType: string | undefined;
    fileFolder: FileFolder;
  }) {
    const ext = filename.split('.')?.[1];
    const id = uuidV4();
    const name = `${id}${ext ? `.${ext}` : ''}`;

    await this._uploadFile({
      file,
      filename: name,
      mimeType,
      fileFolder,
    });

    return {
      id,
      mimeType,
      path: `${fileFolder}/${name}`,
    };
  }

  async uploadImage({
    file,
    filename,
    mimeType,
    fileFolder,
  }: {
    file: Buffer | Uint8Array | string;
    filename: string;
    mimeType: string | undefined;
    fileFolder: FileFolder;
  }) {
    const ext = filename.split('.')?.[1];
    const id = uuidV4();
    const name = `${id}${ext ? `.${ext}` : ''}`;

    const cropSizes = settings.storage.imageCropSizes[fileFolder];
    if (!cropSizes) {
      throw new Error(`No crop sizes found for ${fileFolder}`);
    }

    const sizes = cropSizes.map((shortSize) => getCropSize(shortSize));
    const images = await Promise.all(
      sizes.map((size) =>
        sharp(file).resize({
          [size?.type || 'width']: size?.value ?? undefined,
        }),
      ),
    );

    const paths: Array<string> = [];

    await Promise.all(
      images.map(async (image, index) => {
        const buffer = await image.toBuffer();

        paths.push(`${fileFolder}/${cropSizes[index]}/${name}`);

        return this.uploadFile({
          file: buffer,
          filename: `${cropSizes[index]}/${name}`,
          mimeType,
          fileFolder,
        });
      }),
    );

    return {
      id,
      mimeType,
      paths,
    };
  }
}
