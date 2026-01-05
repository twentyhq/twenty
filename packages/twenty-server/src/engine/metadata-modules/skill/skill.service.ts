import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { fromCreateSkillInputToFlatSkillToCreate } from 'src/engine/metadata-modules/flat-skill/utils/from-create-skill-input-to-flat-skill-to-create.util';
import { fromDeleteSkillInputToFlatSkillOrThrow } from 'src/engine/metadata-modules/flat-skill/utils/from-delete-skill-input-to-flat-skill-or-throw.util';
import { fromFlatSkillToSkillDto } from 'src/engine/metadata-modules/flat-skill/utils/from-flat-skill-to-skill-dto.util';
import { fromUpdateSkillInputToFlatSkillToUpdateOrThrow } from 'src/engine/metadata-modules/flat-skill/utils/from-update-skill-input-to-flat-skill-to-update-or-throw.util';
import { type CreateSkillInput } from 'src/engine/metadata-modules/skill/dtos/create-skill.input';
import { type SkillDTO } from 'src/engine/metadata-modules/skill/dtos/skill.dto';
import { type UpdateSkillInput } from 'src/engine/metadata-modules/skill/dtos/update-skill.input';
import {
  SkillException,
  SkillExceptionCode,
} from 'src/engine/metadata-modules/skill/skill.exception';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class SkillService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findAll(workspaceId: string): Promise<SkillDTO[]> {
    const { flatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    return Object.values(flatSkillMaps.byId)
      .filter(isDefined)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map(fromFlatSkillToSkillDto);
  }

  async findById(id: string, workspaceId: string): Promise<SkillDTO | null> {
    const { flatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    const flatSkill = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatSkillMaps,
    });

    if (!isDefined(flatSkill)) {
      return null;
    }

    return fromFlatSkillToSkillDto(flatSkill);
  }

  async create(
    input: CreateSkillInput,
    workspaceId: string,
  ): Promise<SkillDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatSkillToCreate = fromCreateSkillInputToFlatSkillToCreate({
      createSkillInput: input,
      workspaceId,
      applicationId: workspaceCustomFlatApplication.id,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            skill: {
              flatEntityToCreate: [flatSkillToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating skill',
      );
    }

    const { flatSkillMaps: recomputedFlatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    return fromFlatSkillToSkillDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatSkillToCreate.id,
        flatEntityMaps: recomputedFlatSkillMaps,
      }),
    );
  }

  async update(
    input: UpdateSkillInput,
    workspaceId: string,
  ): Promise<SkillDTO> {
    const { flatSkillMaps: existingFlatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    const flatSkillToUpdate = fromUpdateSkillInputToFlatSkillToUpdateOrThrow({
      flatSkillMaps: existingFlatSkillMaps,
      updateSkillInput: input,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            skill: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatSkillToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating skill',
      );
    }

    const { flatSkillMaps: recomputedFlatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    return fromFlatSkillToSkillDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: input.id,
        flatEntityMaps: recomputedFlatSkillMaps,
      }),
    );
  }

  async delete(id: string, workspaceId: string): Promise<SkillDTO> {
    const { flatSkillMaps: existingFlatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    const flatSkillToDelete = fromDeleteSkillInputToFlatSkillOrThrow({
      flatSkillMaps: existingFlatSkillMaps,
      skillId: id,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            skill: {
              flatEntityToCreate: [],
              flatEntityToDelete: [flatSkillToDelete],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting skill',
      );
    }

    return fromFlatSkillToSkillDto(flatSkillToDelete);
  }

  async findAllFlatSkills(workspaceId: string): Promise<FlatSkill[]> {
    const { flatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    return Object.values(flatSkillMaps.byId)
      .filter(isDefined)
      .filter((flatSkill) => flatSkill.isActive)
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  async findFlatSkillsByNames(
    names: string[],
    workspaceId: string,
  ): Promise<FlatSkill[]> {
    if (names.length === 0) {
      return [];
    }

    const { flatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    return Object.values(flatSkillMaps.byId)
      .filter(isDefined)
      .filter(
        (flatSkill) => names.includes(flatSkill.name) && flatSkill.isActive,
      );
  }

  async activate(id: string, workspaceId: string): Promise<SkillDTO> {
    const { flatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    const existingFlatSkill = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: flatSkillMaps,
    });

    const flatSkillToUpdate: FlatSkill = {
      ...existingFlatSkill,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            skill: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatSkillToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while activating skill',
      );
    }

    const { flatSkillMaps: recomputedFlatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    return fromFlatSkillToSkillDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: recomputedFlatSkillMaps,
      }),
    );
  }

  async deactivate(id: string, workspaceId: string): Promise<SkillDTO> {
    const { flatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    const existingFlatSkill = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: flatSkillMaps,
    });

    const flatSkillToUpdate: FlatSkill = {
      ...existingFlatSkill,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            skill: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatSkillToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deactivating skill',
      );
    }

    const { flatSkillMaps: recomputedFlatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    return fromFlatSkillToSkillDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: recomputedFlatSkillMaps,
      }),
    );
  }

  async findByIdOrThrow(id: string, workspaceId: string): Promise<SkillDTO> {
    const skill = await this.findById(id, workspaceId);

    if (!isDefined(skill)) {
      throw new SkillException(
        'Skill not found',
        SkillExceptionCode.SKILL_NOT_FOUND,
      );
    }

    return skill;
  }
}
