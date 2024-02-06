import { CaptchaValidateResult } from 'src/integrations/captcha/interfaces';

export interface CaptchaDriver {
  validate(token: string): Promise<CaptchaValidateResult>;
}
