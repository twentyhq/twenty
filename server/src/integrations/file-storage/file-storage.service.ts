import { Inject, Injectable } from '@nestjs/common';
import { STORAGE_DRIVER } from './file-storage.constants';
import { StorageDriver } from './drivers/interfaces/storage-driver.interface';
import { Readable } from 'stream';

@Injectable()
export class FileStorageService implements StorageDriver {
  constructor(@Inject(STORAGE_DRIVER) private driver: StorageDriver) {}

  write(params: {
    file: string | Buffer | Uint8Array;
    name: string;
    folder: string;
    mimeType: string | undefined;
  }): Promise<void> {
    return this.driver.write(params);
  }

  read(params: { folderPath: string; filename: string }): Promise<Readable> {
    return this.driver.read(params);
  }
}
