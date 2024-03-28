import { Module, Provider, Type as NestType } from '@nestjs/common';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { TWENTY_APP_METADATA } from 'src/engine/twenty-app/twenty-app.metadata';
import { pick } from 'src/utils/pick';

export interface TwentyAppMetadata extends ModuleMetadata {
  configuration?: string;
  resolvers?: Array<any>;
  standardObjects?: Array<any>;
  listeners?: Array<any>;
  jobs?: Array<any>;
}

export function TwentyApp(appMetadata: TwentyAppMetadata): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    for (const metadataProperty of Object.values(TWENTY_APP_METADATA)) {
      const property = metadataProperty as keyof TwentyAppMetadata;

      if (appMetadata[property] != null) {
        Reflect.defineMetadata(property, appMetadata[property], target);
      }
    }
    const nestModuleMetadata = pick(
      appMetadata,
      Object.values(MODULE_METADATA) as any,
    );

    // Automatically add any of the Plugin's "providers" to the "exports" array. This is done
    // because when a plugin defines GraphQL resolvers, these resolvers are used to dynamically
    // created a new Module in the ApiModule, and if those resolvers depend on any providers,
    // the must be exported.
    // However, we must omit any global providers
    const nestGlobalProviderTokens = [
      APP_INTERCEPTOR,
      APP_FILTER,
      APP_GUARD,
      APP_PIPE,
    ];

    const exportedProviders = (nestModuleMetadata.providers || []).filter(
      (provider) => {
        if (isNamedProvider(provider)) {
          if (nestGlobalProviderTokens.includes(provider.provide as any)) {
            return false;
          }
        }

        return true;
      },
    );

    nestModuleMetadata.exports = [
      ...(nestModuleMetadata.exports || []),
      ...exportedProviders,
    ];
    Module(nestModuleMetadata)(target);
  };
}

function isNamedProvider(
  provider: Provider,
): provider is Exclude<Provider, NestType<any>> {
  return provider.hasOwnProperty('provide');
}
