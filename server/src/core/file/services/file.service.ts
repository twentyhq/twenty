import { Injectable } from '@nestjs/common';

import { FileStorageService } from 'src/integrations/file-storage/file-storage.service';

@Injectable()
export class FileService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async getFileStream(folderPath: string, filename: string) {
    return this.fileStorageService.read({
      folderPath,
      filename,
    });
  }
}
