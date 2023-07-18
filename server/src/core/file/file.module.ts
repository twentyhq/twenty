import { Module } from '@nestjs/common';
import { FileService } from './services/file.service';
import { FileUploadService } from './services/file-upload.service';
import { FileUploadResolver } from './resolvers/file-upload.resolver';
import { FileController } from './controllers/file.controller';
import { AttachmentService } from './services/attachment.service';

@Module({
  providers: [
    FileService,
    FileUploadService,
    FileUploadResolver,
    AttachmentService,
  ],
  exports: [FileService, FileUploadService],
  controllers: [FileController],
})
export class FileModule {}
