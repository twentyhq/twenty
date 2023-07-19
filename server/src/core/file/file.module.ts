import { Module } from '@nestjs/common';

import { FileService } from './services/file.service';
import { FileUploadService } from './services/file-upload.service';
import { FileUploadResolver } from './resolvers/file-upload.resolver';
import { FileController } from './controllers/file.controller';

@Module({
  providers: [FileService, FileUploadService, FileUploadResolver],
  exports: [FileService, FileUploadService],
  controllers: [FileController],
})
export class FileModule {}
