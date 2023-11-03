import { Module } from '@nestjs/common';

import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { AbilityModule } from 'src/ability/ability.module';
import { PrismaModule } from 'src/database/prisma.module';

import { AttachmentResolver } from './resolvers/attachment.resolver';
import { AttachmentService } from './services/attachment.service';

@Module({
  imports: [AbilityModule, PrismaModule],
  providers: [AttachmentService, AttachmentResolver, FileUploadService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
