import { Module } from '@nestjs/common';

import { CreateWebhookTool } from 'src/engine/metadata-modules/webhook/tools/create-webhook.tool';
import { DeleteWebhookTool } from 'src/engine/metadata-modules/webhook/tools/delete-webhook.tool';
import { ListWebhooksTool } from 'src/engine/metadata-modules/webhook/tools/list-webhooks.tool';
import { UpdateWebhookTool } from 'src/engine/metadata-modules/webhook/tools/update-webhook.tool';
import { WebhookModule } from 'src/engine/metadata-modules/webhook/webhook.module';

@Module({
  imports: [WebhookModule],
  providers: [
    ListWebhooksTool,
    CreateWebhookTool,
    UpdateWebhookTool,
    DeleteWebhookTool,
  ],
})
export class WebhookToolsModule {}
