import { Module } from '@nestjs/common';

import { DeleteWebhookTool } from 'src/engine/metadata-modules/webhook/tools/delete-webhook.tool';
import { WebhookToolWorkspaceService } from 'src/engine/metadata-modules/webhook/tools/services/webhook-tool.workspace-service';
import { WebhookModule } from 'src/engine/metadata-modules/webhook/webhook.module';

@Module({
  imports: [WebhookModule],
  providers: [WebhookToolWorkspaceService, DeleteWebhookTool],
  exports: [WebhookToolWorkspaceService],
})
export class WebhookToolsModule {}
