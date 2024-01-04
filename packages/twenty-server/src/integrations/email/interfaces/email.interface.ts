import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import SMTPConnection from 'nodemailer/lib/smtp-connection';

export enum EmailDriverType {
  Logger = 'logger',
  Smtp = 'smtp',
}

export type EmailModuleOptions = SMTPConnection.Options | undefined;

export type EmailModuleAsyncOptions = {
  useFactory: (...args: any[]) => EmailModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
