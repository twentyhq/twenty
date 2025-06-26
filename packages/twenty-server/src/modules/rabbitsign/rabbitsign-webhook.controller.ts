import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { RabbitSignWebhookPayloadDto } from './dtos/rabbit-sign-webhook-payload.dto';
import { RabbitSignSignatureService } from './rabbitsignsignature.service';

@Controller('webhooks/rabbitsign')
@UseFilters()
export class RabbitSignWebhookController {
  constructor(
    private readonly rabbitSignSignatureService: RabbitSignSignatureService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  @Post('update-signature')
  @UseGuards(PublicEndpointGuard)
  async updateSignatureFromWebhook(
    @Body() payload: RabbitSignWebhookPayloadDto,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    try {
      // Extract workspace from the request origin
      const origin = request.get('origin') || request.get('host') || '';
      const workspace = await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(origin);
      
      if (!workspace) {
        throw new BadRequestException('Could not determine workspace from request origin');
      }

      const workspaceId = workspace.id;

      // Try to find signature by folderId
      const foundSignatureId = await this.rabbitSignSignatureService.findSignatureByFolderId(
        workspaceId,
        payload.folderId,
      );
      
      if (!foundSignatureId) {
        throw new BadRequestException(`No signature found for folderId: ${payload.folderId}`);
      }
      
      await this.rabbitSignSignatureService.updateSignatureFromRabbitSignData(
        workspaceId,
        foundSignatureId,
        {
          folderId: payload.folderId,
          creatorEmail: payload.creatorEmail,
          title: payload.title,
          summary: payload.summary,
          folderStatus: payload.folderStatus,
          signers: payload.signers,
          ccList: payload.ccList,
          creationTimeUtc: payload.creationTimeUtc,
          downloadUrl: payload.downloadUrl,
        },
      );
      
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Signature updated successfully',
        folderId: payload.folderId,
        signatureId: foundSignatureId,
      });
    } catch (error) {
      console.error('Failed to update signature from webhook data:', error);
      
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: error.message,
        });
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
} 