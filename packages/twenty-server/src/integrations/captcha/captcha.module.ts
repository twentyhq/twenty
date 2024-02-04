import { DynamicModule, Global } from '@nestjs/common';

import { CAPTCHA_DRIVER } from 'src/integrations/captcha/captcha.constants';
import { GoogleRecaptchaDriver } from 'src/integrations/captcha/drivers/google-recaptcha.driver';
import { HCaptchaDriver } from 'src/integrations/captcha/drivers/hcaptcha.driver';
import { TurnstileDriver } from 'src/integrations/captcha/drivers/turnstile.driver';
import {
  CaptchaDriverType,
  CaptchaModuleAsyncOptions,
} from 'src/integrations/captcha/interfaces';

@Global()
export class CaptchaModule {
  static forRoot(options: CaptchaModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: CAPTCHA_DRIVER,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        if (!config) {
          return;
        }

        switch (config.type) {
          case CaptchaDriverType.GoogleRecatpcha:
            return new GoogleRecaptchaDriver(config.options);
          case CaptchaDriverType.HCaptcha:
            return new HCaptchaDriver(config.options);
          case CaptchaDriverType.Turnstile:
            return new TurnstileDriver(config.options);
          default:
            return;
        }
      },
      inject: options.inject || [],
    };

    return {
      module: CaptchaModule,
      providers: [provider],
      exports: [],
    };
  }
}
