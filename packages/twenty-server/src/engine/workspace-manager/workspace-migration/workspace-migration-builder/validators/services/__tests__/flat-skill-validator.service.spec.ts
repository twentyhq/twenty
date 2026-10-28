import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { type UniversalFlatSkill } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-skill.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { FlatSkillValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-skill-validator.service';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER = v4();
const now = new Date().toISOString();

const standardSkill: UniversalFlatSkill = {
  universalIdentifier: v4(),
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION.universalIdentifier,
  name: 'workflow-building',
  label: 'Workflow Building',
  icon: null,
  description: null,
  content: 'Build workflows',
  isSystem: false,
  isActive: true,
  overrides: null,
  createdAt: now,
  updatedAt: now,
};

const buildFeatureFlagsMap =
  (): WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'] =>
    Object.values(FeatureFlagKey).reduce(
      (featureFlagsMap, key) => ({ ...featureFlagsMap, [key]: false }),
      {} as WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'],
    );

const validateWorkspaceUpdate = (
  flatEntityUpdate: FlatEntityUpdateValidationArgs<'skill'>['flatEntityUpdate'],
) => {
  const optimisticFlatEntityMapsAndRelatedFlatEntityMaps =
    createEmptyAllFlatEntityMaps();

  addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
    universalFlatEntity: standardSkill,
    universalFlatEntityMapsToMutate:
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatSkillMaps,
  });

  return new FlatSkillValidatorService().validateFlatSkillUpdate({
    additionalCacheDataMaps: {
      featureFlagsMap: buildFeatureFlagsMap(),
      billingEntitlements: {},
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    finalFlatEntityMaps:
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatSkillMaps,
    workspaceId: v4(),
    buildOptions: {
      isSystemBuild: false,
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    },
    flatEntityUpdate,
    universalIdentifier: standardSkill.universalIdentifier,
  });
};

const errorCodes = (result: { errors: { code: string }[] }) =>
  result.errors.map(({ code }) => code);

describe('FlatSkillValidatorService', () => {
  it('accepts workspace overrides on a standard skill', () => {
    const result = validateWorkspaceUpdate({
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          label: 'Workspace label',
          isActive: false,
        },
      },
    });

    expect(errorCodes(result)).toEqual([]);
  });

  it('refuses a direct edit of a standard skill', () => {
    const result = validateWorkspaceUpdate({ label: 'Workspace label' });

    expect(errorCodes(result)).toEqual(['SKILL_IS_STANDARD']);
  });

  it.each([
    ['empties the skill content', { content: '' }],
    ['sets the skill label to null', { label: null }],
  ])('refuses an override that %s', (_description, override) => {
    const result = validateWorkspaceUpdate({
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: override,
      },
    });

    expect(errorCodes(result)).toEqual(['INVALID_SKILL_INPUT']);
  });
});
