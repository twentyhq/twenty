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

import { type PermissionFlagType } from 'twenty-shared/constants';
import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { APPLICATION_TARGET_METADATA_KEY } from 'src/engine/core-modules/application/constants/application-target-metadata-key.constant';
import { type ApplicationTarget } from 'src/engine/core-modules/application/types/application-target.type';
import { AUTH_PRINCIPAL_GUARD_CONFIG_KEY } from 'src/engine/guards/constants/auth-principal-guard-config-key.constant';
import { FEATURE_FLAG_GUARD_CONFIG_KEY } from 'src/engine/guards/constants/feature-flag-guard-config-key.constant';
import { SETTINGS_PERMISSION_GUARD_CONFIG_KEY } from 'src/engine/guards/constants/settings-permission-guard-config-key.constant';
import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';
import { isAuthPrincipalVariantAccepted } from 'src/engine/guards/utils/is-auth-principal-variant-accepted.util';

type UserSessionVariant = Extract<
  AuthPrincipalVariant,
  { kind: 'userSession' }
>['variant'];

type UserVariant = Extract<
  AuthPrincipalVariant,
  { kind: 'application' }
>['variant'];

type AcceptedAuthPrincipals = {
  userSession: Record<UserSessionVariant, boolean>;
  apiKey: boolean;
  oauthClient: Record<UserVariant, boolean>;
  application: Record<UserVariant | 'withAgent', boolean>;
};

type EndpointPermissionDeclarations = {
  authPrincipalGuards: AcceptedAuthPrincipals[];
  requiredPermissionFlags: PermissionFlagType[];
  requiredFeatureFlags: FeatureFlagKey[];
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

const readGuardConfigs = <TGuardConfig>({
  reflector,
  guardsOwners,
  guardConfigKey,
}: {
  reflector: Reflector;
  guardsOwners: (EndpointClass | EndpointHandler)[];
  guardConfigKey: string;
}): TGuardConfig[] =>
  guardsOwners
    .flatMap(
      (guardsOwner) =>
        reflector.get<Guard[] | undefined>(GUARDS_METADATA, guardsOwner) ?? [],
    )
    .map((guard) =>
      reflector.get<TGuardConfig | undefined>(
        guardConfigKey,
        typeof guard === 'function' ? guard : guard.constructor,
      ),
    )
    .filter(isDefined);

// The guard's own decisions, so a shorthand such as `application: true`
// shows what it leaves out
const toAcceptedAuthPrincipals = (
  authPrincipalGuardConfig: AuthPrincipalGuardConfig,
): AcceptedAuthPrincipals => {
  const isAccepted = (authPrincipalVariant: AuthPrincipalVariant): boolean =>
    isAuthPrincipalVariantAccepted({
      authPrincipalGuardConfig,
      authPrincipalVariant,
    });

  return {
    userSession: {
      standard: isAccepted({ kind: 'userSession', variant: 'standard' }),
      impersonated: isAccepted({
        kind: 'userSession',
        variant: 'impersonated',
      }),
      playground: isAccepted({ kind: 'userSession', variant: 'playground' }),
      workspaceAgnostic: isAccepted({
        kind: 'userSession',
        variant: 'workspaceAgnostic',
      }),
    },
    apiKey: isAccepted({ kind: 'apiKey' }),
    oauthClient: {
      withUser: isAccepted({ kind: 'oauthClient', variant: 'withUser' }),
      withoutUser: isAccepted({ kind: 'oauthClient', variant: 'withoutUser' }),
    },
    application: {
      withUser: isAccepted({
        kind: 'application',
        variant: 'withUser',
        withAgent: false,
      }),
      withoutUser: isAccepted({
        kind: 'application',
        variant: 'withoutUser',
        withAgent: false,
      }),
      withAgent:
        isAccepted({
          kind: 'application',
          variant: 'withUser',
          withAgent: true,
        }) ||
        isAccepted({
          kind: 'application',
          variant: 'withoutUser',
          withAgent: true,
        }),
    },
  };
};

const compareCodePoints = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const toSortedUniqueValues = <TValue extends string>(
  values: TValue[],
): TValue[] => [...new Set(values)].sort(compareCodePoints);

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

      const guardsOwners = [endpointClass, handler];

      // Every class and method guard must pass, so the union of their flags
      // is what the endpoint requires
      declarationsByEndpoint.set(endpoint, {
        authPrincipalGuards: readGuardConfigs<AuthPrincipalGuardConfig>({
          reflector,
          guardsOwners,
          guardConfigKey: AUTH_PRINCIPAL_GUARD_CONFIG_KEY,
        }).map(toAcceptedAuthPrincipals),
        requiredPermissionFlags: toSortedUniqueValues(
          readGuardConfigs<PermissionFlagType[]>({
            reflector,
            guardsOwners,
            guardConfigKey: SETTINGS_PERMISSION_GUARD_CONFIG_KEY,
          }).flat(),
        ),
        requiredFeatureFlags: toSortedUniqueValues(
          readGuardConfigs<FeatureFlagKey>({
            reflector,
            guardsOwners,
            guardConfigKey: FEATURE_FLAG_GUARD_CONFIG_KEY,
          }),
        ),
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
