import { DynamicModule, Global } from '@nestjs/common';

import { EmailModuleAsyncOptions } from 'src/integrations/email/interfaces/email.interface';

import { EMAIL_DRIVER } from 'src/integrations/email/email.constants';
import { LoggerDriver } from 'src/integrations/email/drivers/logger.driver';
import { SmtpDriver } from 'src/integrations/email/drivers/smtp.driver';
import { EmailService } from 'src/integrations/email/email.service';
import { EmailSenderService } from 'src/integrations/email/email-sender.service';

@Global()
export class EmailModule {
  static forRoot(options: EmailModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: EMAIL_DRIVER,
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);

        return config ? new SmtpDriver(config) : new LoggerDriver();
      },
      inject: options.inject || [],
    };

    return {
      module: EmailModule,
      providers: [EmailSenderService, EmailService, provider],
      exports: [EmailSenderService, EmailService],
    };
  }
}
