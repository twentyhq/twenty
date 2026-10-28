import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { type UniversalFlatConnectionProvider } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-connection-provider.type';
import { type UniversalFlatMcpServer } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-mcp-server.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { FlatMcpServerValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-mcp-server-validator.service';

const WORKSPACE_ID = v4();
const APPLICATION_UNIVERSAL_IDENTIFIER = v4();
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER = v4();
const PROVIDER_UNIVERSAL_IDENTIFIER = v4();
const OTHER_APPLICATION_PROVIDER_UNIVERSAL_IDENTIFIER = v4();
const now = new Date().toISOString();

const buildProvider = (
  universalIdentifier: string,
  applicationUniversalIdentifier: string,
): UniversalFlatConnectionProvider => ({
  universalIdentifier,
  applicationUniversalIdentifier,
  name: universalIdentifier,
  displayName: universalIdentifier,
  logo: null,
  type: 'oauth',
  scope: 'WORKSPACE',
  oauthConfig: null,
  customConfig: null,
  identifyAccountLogicFunctionUniversalIdentifier: null,
  onConnectLogicFunctionUniversalIdentifier: null,
  onDisconnectLogicFunctionUniversalIdentifier: null,
  createdAt: now,
  updatedAt: now,
});

const buildMcpServer = (
  overrides: Partial<UniversalFlatMcpServer> = {},
): UniversalFlatMcpServer => ({
  universalIdentifier: v4(),
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'docs',
  label: 'Docs',
  url: 'https://docs.example.com/mcp',
  connectionProviderUniversalIdentifier: null,
  isActive: true,
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

const buildFeatureFlagsMap =
  (): WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'] =>
    Object.values(FeatureFlagKey).reduce(
      (featureFlagsMap, key) => ({ ...featureFlagsMap, [key]: false }),
      {} as WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'],
    );

const buildValidationArgs = (
  existingMcpServers: UniversalFlatMcpServer[],
): Omit<
  UniversalFlatEntityValidationArgs<'mcpServer'>,
  'flatEntityToValidate'
> => {
  const optimisticFlatEntityMapsAndRelatedFlatEntityMaps =
    createEmptyAllFlatEntityMaps();

  for (const provider of [
    buildProvider(
      PROVIDER_UNIVERSAL_IDENTIFIER,
      APPLICATION_UNIVERSAL_IDENTIFIER,
    ),
    buildProvider(
      OTHER_APPLICATION_PROVIDER_UNIVERSAL_IDENTIFIER,
      OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
    ),
  ]) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: provider,
      universalFlatEntityMapsToMutate:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatConnectionProviderMaps,
    });
  }

  for (const mcpServer of existingMcpServers) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: mcpServer,
      universalFlatEntityMapsToMutate:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatMcpServerMaps,
    });
  }

  return {
    additionalCacheDataMaps: {
      featureFlagsMap: buildFeatureFlagsMap(),
      billingEntitlements: {},
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
    workspaceId: WORKSPACE_ID,
    buildOptions: {
      isSystemBuild: false,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    },
  };
};

const errorCodes = (result: { errors: { code: string }[] }) =>
  result.errors.map(({ code }) => code);

describe('FlatMcpServerValidatorService', () => {
  const validator = new FlatMcpServerValidatorService();

  describe('creation', () => {
    const validate = (mcpServer: UniversalFlatMcpServer) =>
      validator.validateFlatMcpServerCreation({
        ...buildValidationArgs([]),
        flatEntityToValidate: mcpServer,
      });

    it('accepts a provider of the same application', () => {
      const result = validate(
        buildMcpServer({
          connectionProviderUniversalIdentifier: PROVIDER_UNIVERSAL_IDENTIFIER,
        }),
      );

      expect(errorCodes(result)).toEqual([]);
    });

    it.each([
      ['unknown', v4(), 'CONNECTION_PROVIDER_NOT_FOUND'],
      [
        'another application',
        OTHER_APPLICATION_PROVIDER_UNIVERSAL_IDENTIFIER,
        'CONNECTION_PROVIDER_NOT_IN_APPLICATION',
      ],
    ])('rejects a provider that is %s', (_label, providerIdentifier, code) => {
      const result = validate(
        buildMcpServer({
          connectionProviderUniversalIdentifier: providerIdentifier,
        }),
      );

      expect(errorCodes(result)).toEqual([code]);
    });
  });

  describe('update', () => {
    const existing = buildMcpServer({
      connectionProviderUniversalIdentifier: PROVIDER_UNIVERSAL_IDENTIFIER,
    });

    const validate = (
      flatEntityUpdate: FlatEntityUpdateValidationArgs<'mcpServer'>['flatEntityUpdate'],
    ) => {
      const { remainingFlatEntityMapsToValidate: _unused, ...args } =
        buildValidationArgs([existing]);

      return validator.validateFlatMcpServerUpdate({
        ...args,
        finalFlatEntityMaps:
          args.optimisticFlatEntityMapsAndRelatedFlatEntityMaps
            .flatMcpServerMaps,
        flatEntityUpdate,
        universalIdentifier: existing.universalIdentifier,
      });
    };

    it('rejects a url change while a provider is linked', () => {
      const result = validate({ url: 'https://other.example.com/mcp' });

      expect(errorCodes(result)).toEqual([
        'MCP_SERVER_URL_CHANGE_WHILE_CONNECTED',
      ]);
    });

    it('accepts a url change that unlinks the provider in the same update', () => {
      const result = validate({
        url: 'https://other.example.com/mcp',
        connectionProviderUniversalIdentifier: null,
      });

      expect(errorCodes(result)).toEqual([]);
    });

    it('accepts the same url while linked', () => {
      const result = validate({ url: existing.url, label: 'Renamed' });

      expect(errorCodes(result)).toEqual([]);
    });
  });
});
