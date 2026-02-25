import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { MessagingAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/services/messaging-attachment-download.service';

@Controller('message-attachments')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class MessageAttachmentController {
  constructor(
    private readonly messagingAttachmentDownloadService: MessagingAttachmentDownloadService,
  ) {}

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Res() res: Response,
  ) {
    try {
      const { content, filename, mimeType } =
        await this.messagingAttachmentDownloadService.download(
          id,
          workspace.id,
        );

      res.setHeader('Content-Type', mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(filename)}"`,
      );
      res.send(content);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new NotFoundException('Attachment could not be downloaded');
    }
  }
}
