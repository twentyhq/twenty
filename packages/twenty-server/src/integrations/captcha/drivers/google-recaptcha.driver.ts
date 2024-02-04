import axios, { AxiosInstance } from 'axios';

import { CaptchaDriver } from 'src/integrations/captcha/drivers/interfaces/captcha-driver.interface';

import { CaptchaDriverOptions } from 'src/integrations/captcha/interfaces';

export type GoogleRecatpchaServerResponse = {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  'error-codes': string[];
};

export class GoogleRecaptchaDriver implements CaptchaDriver {
  private readonly siteKey: string;
  private readonly secretKey: string;
  private readonly httpService: AxiosInstance;
  constructor(private options: CaptchaDriverOptions) {
    this.siteKey = options.siteKey;
    this.secretKey = options.secretKey;
    this.httpService = axios.create({
      baseURL: 'https://www.google.com/recaptcha/api/siteverify',
    });
  }

  async validate(token: string): Promise<boolean> {
    const formData = {
      secret: this.secretKey,
      response: token,
    };
    const response: GoogleRecatpchaServerResponse = await this.httpService.post(
      '/',
      formData,
    );

    if (!response.success) {
      throw new Error(response['error-codes']?.[0] ?? 'Captcha Error');
    }

    return response.success;
  }
}
