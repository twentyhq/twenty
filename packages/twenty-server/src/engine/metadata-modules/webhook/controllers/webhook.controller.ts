import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/create-webhook.input';
import { UpdateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/update-webhook.input';
import { type WebhookDTO } from 'src/engine/metadata-modules/webhook/dtos/webhook.dto';
import { WebhookService } from 'src/engine/metadata-modules/webhook/webhook.service';

@Controller(['rest/webhooks', 'rest/metadata/webhooks'])
@UseGuards(
  JwtAuthGuard,
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
)
@UseFilters(RestApiExceptionFilter)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  async findAll(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO[]> {
    return this.webhookService.findAll(workspace.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO | null> {
    return this.webhookService.findById(id, workspace.id);
  }

  @Post()
  async create(
    @Body() createWebhookDto: CreateWebhookInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO> {
    return this.webhookService.create(createWebhookDto, workspace.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    updateWebhookDto: {
      targetUrl?: string;
      operations?: string[];
      description?: string;
      secret?: string;
    },
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO> {
    const input: UpdateWebhookInput = {
      id,
      update: updateWebhookDto,
    };

    return this.webhookService.update(input, workspace.id);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.webhookService.delete(id, workspace.id);

    return true;
  }
}
