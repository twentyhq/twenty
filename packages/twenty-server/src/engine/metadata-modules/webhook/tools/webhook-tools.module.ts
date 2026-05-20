import { Global, Module } from '@nestjs/common';

import { WEBHOOK_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/webhook-tool-service.token';
import { WebhookModule } from 'src/engine/metadata-modules/webhook/webhook.module';
import { WebhookToolWorkspaceService } from 'src/engine/metadata-modules/webhook/tools/services/webhook-tool.workspace-service';

// Global module to make WEBHOOK_TOOL_SERVICE_TOKEN available to ToolProviderModule
// without creating a circular dependency.
@Global()
@Module({
  imports: [WebhookModule],
  providers: [
    WebhookToolWorkspaceService,
    {
      provide: WEBHOOK_TOOL_SERVICE_TOKEN,
      useExisting: WebhookToolWorkspaceService,
    },
  ],
  exports: [WebhookToolWorkspaceService, WEBHOOK_TOOL_SERVICE_TOKEN],
})
export class WebhookToolsModule {}
