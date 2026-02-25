import { Module } from '@nestjs/common';

import { UserModule } from 'src/engine/core-modules/user/user.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';
import { GmailHtmlPreviewService } from 'src/modules/messaging/message-html-preview/drivers/gmail/services/gmail-html-preview.service';
import { ImapHtmlPreviewService } from 'src/modules/messaging/message-html-preview/drivers/imap/services/imap-html-preview.service';
import { MicrosoftHtmlPreviewService } from 'src/modules/messaging/message-html-preview/drivers/microsoft/services/microsoft-html-preview.service';
import { MessageHtmlPreviewResolver } from 'src/modules/messaging/message-html-preview/message-html-preview.resolver';
import { MessageHtmlPreviewService } from 'src/modules/messaging/message-html-preview/services/message-html-preview.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    UserModule,
    PermissionsModule,
    OAuth2ClientManagerModule,
    RefreshTokensManagerModule,
  ],
  providers: [
    MessageHtmlPreviewResolver,
    MessageHtmlPreviewService,
    GmailHtmlPreviewService,
    MicrosoftHtmlPreviewService,
    ImapHtmlPreviewService,
  ],
})
export class MessageHtmlPreviewModule {}
