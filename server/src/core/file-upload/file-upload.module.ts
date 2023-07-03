import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadResolver } from './file-upload.resolver';
import { FileUploadController } from './file-upload.controller';

@Module({
  providers: [FileUploadService, FileUploadResolver],
  exports: [FileUploadService],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
