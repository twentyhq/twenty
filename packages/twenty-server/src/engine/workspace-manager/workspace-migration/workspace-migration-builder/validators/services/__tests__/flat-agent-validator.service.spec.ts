import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { fromAgentManifestToUniversalFlatAgent } from 'src/engine/core-modules/application/utils/from-agent-manifest-to-universal-flat-agent.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { FlatAgentValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-agent-validator.service';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER = v4();

const standardAgent = fromAgentManifestToUniversalFlatAgent({
  agentManifest: {
    universalIdentifier: v4(),
    name: 'standard-agent',
    label: 'Standard Agent',
    prompt: 'You are a standard agent.',
  },
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION.universalIdentifier,
  now: new Date().toISOString(),
});

const buildFeatureFlagsMap =
  (): WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'] =>
    Object.values(FeatureFlagKey).reduce(
      (featureFlagsMap, key) => ({ ...featureFlagsMap, [key]: false }),
      {} as WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'],
    );

const validateStandardAgentDeletion = (
  callerApplicationUniversalIdentifier: string,
) => {
  const optimisticFlatEntityMapsAndRelatedFlatEntityMaps =
    createEmptyAllFlatEntityMaps();

  addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
    universalFlatEntity: standardAgent,
    universalFlatEntityMapsToMutate:
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatAgentMaps,
  });

  return new FlatAgentValidatorService().validateFlatAgentDeletion({
    additionalCacheDataMaps: {
      featureFlagsMap: buildFeatureFlagsMap(),
      billingEntitlements: {},
    },
    flatEntityToValidate: standardAgent,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    remainingFlatEntityMapsToValidate:
      createEmptyAllFlatEntityMaps().flatAgentMaps,
    workspaceId: v4(),
    buildOptions: {
      isSystemBuild: false,
      applicationUniversalIdentifier: callerApplicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      flatApplicationMaps: { byId: {}, idByUniversalIdentifier: {} },
    },
  });
};

const errorCodes = (result: { errors: { code: string }[] }) =>
  result.errors.map(({ code }) => code);

describe('FlatAgentValidatorService', () => {
  it('refuses the deletion of a standard agent by the workspace', () => {
    const result = validateStandardAgentDeletion(
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(errorCodes(result)).toEqual(['AGENT_IS_STANDARD']);
  });

  it('accepts the deletion of a standard agent by the twenty standard application', () => {
    const result = validateStandardAgentDeletion(
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );

    expect(errorCodes(result)).toEqual([]);
  });
});
