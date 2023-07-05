import { Injectable, Inject } from '@nestjs/common';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { MODULE_OPTIONS_TOKEN } from './local-storage.module-definition';
import { LocalStorageModuleOptions } from './interfaces';

@Injectable()
export class LocalStorageService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: LocalStorageModuleOptions,
  ) {}

  async createFolder(path: string) {
    if (existsSync(path)) {
      return;
    }

    return fs.mkdir(path, { recursive: true });
  }

  async uploadFile(params: {
    file: Buffer | Uint8Array | string;
    name: string;
    folder: string;
  }) {
    const filePath = `${this.options.storagePath}/${params.folder}/${params.name}`;
    const folderPath = path.dirname(filePath);

    await this.createFolder(folderPath);

    return fs.writeFile(filePath, params.file);
  }
}
