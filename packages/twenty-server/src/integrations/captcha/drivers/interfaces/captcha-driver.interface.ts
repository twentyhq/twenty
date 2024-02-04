export interface CaptchaDriver {
  validate(token: string): Promise<boolean>;
}
