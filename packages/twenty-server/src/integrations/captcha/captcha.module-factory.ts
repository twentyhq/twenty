import {
  CaptchaDriverOptions,
  CaptchaModuleOptions,
} from 'src/integrations/captcha/interfaces';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

export const captchaModuleFactory = (
  environmentService: EnvironmentService,
): CaptchaModuleOptions | undefined => {
  const driver = environmentService.getCaptchaDriver();
  const siteKey = environmentService.getCaptchaSiteKey();
  const secretKey = environmentService.getCaptchaSecretKey();

  if (!driver) {
    return;
  }

  if (!siteKey || !secretKey) {
    throw new Error('Captcha driver requires site key and secret key');
  }

  const captchaOptions: CaptchaDriverOptions = {
    siteKey,
    secretKey,
  };

  return {
    type: driver,
    options: captchaOptions,
  };
};
