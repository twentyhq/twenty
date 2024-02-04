import { Inject, Injectable } from '@nestjs/common';

import { CaptchaDriver } from 'src/integrations/captcha/drivers/interfaces/captcha-driver.interface';

import { CAPTCHA_DRIVER } from 'src/integrations/captcha/captcha.constants';

@Injectable()
export class CaptchaService implements CaptchaDriver {
  constructor(@Inject(CAPTCHA_DRIVER) private driver: CaptchaDriver) {}

  async validate(token: string): Promise<boolean> {
    return await this.driver.validate(token);
  }
}
