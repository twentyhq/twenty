import { type CanActivate, type Type } from '@nestjs/common';
import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import {
  type DiscoveryService,
  type MetadataScanner,
  type Reflector,
} from '@nestjs/core';
import { type InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { RESOLVER_TYPE_METADATA } from '@nestjs/graphql/dist/graphql.constants.js';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { APPLICATION_TARGET_METADATA_KEY } from 'src/engine/core-modules/application/constants/application-target-metadata-key.constant';
import { type ApplicationTarget } from 'src/engine/core-modules/application/types/application-target.type';
import { AUTH_PRINCIPAL_GUARD_CONFIG_KEY } from 'src/engine/guards/constants/auth-principal-guard-config-key.constant';
import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';

type EndpointPermissionDeclarations = {
  authPrincipalGuards: AuthPrincipalGuardConfig[];
  applicationTarget: ApplicationTarget | null;
};

type EndpointClass = Type<object>;

type EndpointHandler = (...args: never[]) => unknown;

type DiscoveredClass = { endpointClass: EndpointClass; isController: boolean };

type Guard = Type<CanActivate> | CanActivate;

const GRAPHQL_OPERATION_TYPES = new Set(['Query', 'Mutation', 'Subscription']);

const discoverClasses = (
  discoveryService: DiscoveryService,
): DiscoveredClass[] => {
  const isControllerByClass = new Map<EndpointClass, boolean>();

  const register = (wrappers: InstanceWrapper[], isController: boolean) => {
    for (const { metatype } of wrappers) {
      if (typeof metatype !== 'function' || !isDefined(metatype.prototype)) {
        continue;
      }

      const endpointClass = metatype as EndpointClass;

      isControllerByClass.set(
        endpointClass,
        isController || (isControllerByClass.get(endpointClass) ?? false),
      );
    }
  };

  register(discoveryService.getControllers(), true);
  register(discoveryService.getProviders(), false);

  return [...isControllerByClass.entries()].map(
    ([endpointClass, isController]) => ({ endpointClass, isController }),
  );
};

const isEndpointHandler = (
  handler: unknown,
  { reflector, isController }: { reflector: Reflector; isController: boolean },
): handler is EndpointHandler =>
  typeof handler === 'function' &&
  (GRAPHQL_OPERATION_TYPES.has(
    reflector.get<string | undefined>(RESOLVER_TYPE_METADATA, handler) ?? '',
  ) ||
    (isController && isDefined(reflector.get(PATH_METADATA, handler))));

const readAuthPrincipalGuardConfigs = ({
  reflector,
  guardsOwner,
}: {
  reflector: Reflector;
  guardsOwner: EndpointClass | EndpointHandler;
}): AuthPrincipalGuardConfig[] =>
  (reflector.get<Guard[] | undefined>(GUARDS_METADATA, guardsOwner) ?? [])
    .map((guard) =>
      reflector.get<AuthPrincipalGuardConfig | undefined>(
        AUTH_PRINCIPAL_GUARD_CONFIG_KEY,
        typeof guard === 'function' ? guard : guard.constructor,
      ),
    )
    .filter(isDefined);

const compareCodePoints = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const stringifyWithSortedKeys = (value: unknown): string =>
  JSON.stringify(value, (_key, nestedValue: unknown) =>
    isPlainObject(nestedValue)
      ? Object.fromEntries(
          Object.entries(nestedValue).sort(([left], [right]) =>
            compareCodePoints(left, right),
          ),
        )
      : nestedValue,
  );

export const collectEndpointPermissionDeclarations = (): string[] => {
  const discoveryService =
    getAppProviderByClassName<DiscoveryService>('DiscoveryService');
  const reflector = getAppProviderByClassName<Reflector>('Reflector');
  const metadataScanner =
    getAppProviderByClassName<MetadataScanner>('MetadataScanner');

  const declarationsByEndpoint = new Map<
    string,
    EndpointPermissionDeclarations
  >();

  for (const { endpointClass, isController } of discoverClasses(
    discoveryService,
  )) {
    const prototype = endpointClass.prototype;

    for (const methodName of metadataScanner.getAllMethodNames(prototype)) {
      const handler: unknown = prototype[methodName as keyof typeof prototype];

      if (!isEndpointHandler(handler, { reflector, isController })) {
        continue;
      }

      const endpoint = `${endpointClass.name}.${methodName}`;

      if (declarationsByEndpoint.has(endpoint)) {
        throw new Error(
          `${endpoint} is declared by two different classes: rename one so the endpoint permission snapshot can tell them apart`,
        );
      }

      declarationsByEndpoint.set(endpoint, {
        authPrincipalGuards: [
          ...readAuthPrincipalGuardConfigs({
            reflector,
            guardsOwner: endpointClass,
          }),
          ...readAuthPrincipalGuardConfigs({ reflector, guardsOwner: handler }),
        ],
        applicationTarget:
          reflector.get<ApplicationTarget | undefined>(
            APPLICATION_TARGET_METADATA_KEY,
            handler,
          ) ?? null,
      });
    }
  }

  return [...declarationsByEndpoint.entries()]
    .sort(([left], [right]) => compareCodePoints(left, right))
    .map(
      ([endpoint, declarations]) =>
        `${endpoint} ${stringifyWithSortedKeys(declarations)}`,
    );
};
