import { FactoryProvider, ModuleMetadata } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';

export enum CaptchaDriverType {
  GoogleRecatpcha = 'google-recaptcha',
  HCaptcha = 'hcaptcha',
  Turnstile = 'turnstile',
}

registerEnumType(CaptchaDriverType, {
  name: 'CaptchaDriverType',
});

export type CaptchaDriverOptions = {
  siteKey: string;
  secretKey: string;
};

export interface GoogleRecatpchaDriverFactoryOptions {
  type: CaptchaDriverType.GoogleRecatpcha;
  options: CaptchaDriverOptions;
}

export interface HCaptchaDriverFactoryOptions {
  type: CaptchaDriverType.HCaptcha;
  options: CaptchaDriverOptions;
}

export interface TurnstileDriverFactoryOptions {
  type: CaptchaDriverType.Turnstile;
  options: CaptchaDriverOptions;
}

export type CaptchaModuleOptions =
  | GoogleRecatpchaDriverFactoryOptions
  | HCaptchaDriverFactoryOptions
  | TurnstileDriverFactoryOptions;

export type CaptchaModuleAsyncOptions = {
  useFactory: (
    ...args: any[]
  ) => CaptchaModuleOptions | Promise<CaptchaModuleOptions> | undefined;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

export type CaptchaValidateResult = { success: boolean; error?: string };
