import { Readable } from 'stream';

export interface StorageDriver {
  read(params: { folderPath: string; filename: string }): Promise<Readable>;
  write(params: {
    file: Buffer | Uint8Array | string;
    name: string;
    folder: string;
    mimeType: string | undefined;
  }): Promise<void>;
}
