import { Module } from '@nestjs/common';
import { AttachmentResolver } from './resolvers/attachment.resolver';
import { FileUploadService } from '../file/services/file-upload.service';
import { AttachmentService } from './services/attachment.service';

@Module({
  providers: [AttachmentService, AttachmentResolver, FileUploadService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
