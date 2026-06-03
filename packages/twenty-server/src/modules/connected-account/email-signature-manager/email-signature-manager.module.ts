import { Module } from '@nestjs/common';

import { GoogleEmailSignatureManagerService } from 'src/modules/connected-account/email-signature-manager/drivers/google/services/google-email-signature-manager.service';
import { EmailSignatureManagerService } from 'src/modules/connected-account/email-signature-manager/services/email-signature-manager.service';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';

@Module({
  imports: [OAuth2ClientManagerModule],
  providers: [EmailSignatureManagerService, GoogleEmailSignatureManagerService],
  exports: [EmailSignatureManagerService],
})
export class EmailSignatureManagerModule {}
