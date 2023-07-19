import { Module } from '@nestjs/common';

import { FileUploadService } from 'src/core/file/services/file-upload.service';

import { AttachmentResolver } from './resolvers/attachment.resolver';
import { AttachmentService } from './services/attachment.service';

@Module({
  providers: [AttachmentService, AttachmentResolver, FileUploadService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
