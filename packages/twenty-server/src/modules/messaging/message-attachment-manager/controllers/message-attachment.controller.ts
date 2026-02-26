import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  PayloadTooLargeException,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { MessagingAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/services/messaging-attachment-download.service';

@Controller('message-attachments')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
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
      const { stream, filename, mimeType, size } =
        await this.messagingAttachmentDownloadService.download(
          id,
          workspace.id,
        );

      res.setHeader('Content-Type', mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(filename)}"`,
      );

      if (isDefined(size)) {
        res.setHeader('Content-Length', String(size));
      }

      stream.on('error', () => {
        if (!res.headersSent) {
          res.status(500).send('Error streaming attachment');
        }
      });

      stream.pipe(res);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof PayloadTooLargeException
      ) {
        throw error;
      }

      if (error instanceof ThrottlerException) {
        throw new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
      }

      throw new NotFoundException('Attachment could not be downloaded');
    }
  }
}
