import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatSharingRuleMaps } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule-maps.type';
import { type FlatSharingRule } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule.type';
import { fromCreateSharingRuleInputToFlatSharingRuleOrThrow } from 'src/engine/metadata-modules/flat-sharing-rule/utils/from-create-sharing-rule-input-to-flat-sharing-rule-or-throw.util';
import { fromFlatSharingRuleToSharingRuleDto } from 'src/engine/metadata-modules/flat-sharing-rule/utils/from-flat-sharing-rule-to-sharing-rule-dto.util';
import { fromUpdateSharingRuleInputToFlatSharingRuleOrThrow } from 'src/engine/metadata-modules/flat-sharing-rule/utils/from-update-sharing-rule-input-to-flat-sharing-rule-or-throw.util';
import { type CreateSharingRuleInput } from 'src/engine/metadata-modules/sharing-rule/dtos/create-sharing-rule.input';
import { type SharingRuleDTO } from 'src/engine/metadata-modules/sharing-rule/dtos/sharing-rule.dto';
import { type UpdateSharingRuleInput } from 'src/engine/metadata-modules/sharing-rule/dtos/update-sharing-rule.input';
import {
  SharingRuleException,
  SharingRuleExceptionCode,
} from 'src/engine/metadata-modules/sharing-rule/exceptions/sharing-rule.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class SharingRuleService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findByObjectMetadataId({
    workspaceId,
    objectMetadataId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<SharingRuleDTO[]> {
    const { flatSharingRuleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatSharingRuleMaps'] },
      );

    return Object.values(flatSharingRuleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatSharingRule) =>
          flatSharingRule.deletedAt === null &&
          flatSharingRule.objectMetadataId === objectMetadataId,
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(fromFlatSharingRuleToSharingRuleDto);
  }

  async create({
    input,
    workspaceId,
  }: {
    input: CreateSharingRuleInput;
    workspaceId: string;
  }): Promise<SharingRuleDTO> {
    const [
      { workspaceCustomFlatApplication },
      { flatObjectMetadataMaps, flatRoleMaps },
    ] = await Promise.all([
      this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      ),
      this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatObjectMetadataMaps', 'flatRoleMaps'],
      }),
    ]);

    const flatSharingRuleToCreate =
      fromCreateSharingRuleInputToFlatSharingRuleOrThrow({
        createSharingRuleInput: input,
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatObjectMetadataMaps,
        flatRoleMaps,
      });

    await this.runSharingRuleMigrationOrThrow({
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      flatEntityToCreate: [flatSharingRuleToCreate],
      errorMessage:
        'Multiple validation errors occurred while creating sharing rule',
    });

    return this.findByIdOrThrow({
      id: flatSharingRuleToCreate.id,
      workspaceId,
    });
  }

  async update({
    input,
    workspaceId,
  }: {
    input: UpdateSharingRuleInput;
    workspaceId: string;
  }): Promise<SharingRuleDTO> {
    const [
      { workspaceCustomFlatApplication },
      { flatSharingRuleMaps, flatRoleMaps },
    ] = await Promise.all([
      this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      ),
      this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatSharingRuleMaps', 'flatRoleMaps'],
      }),
    ]);

    const flatSharingRuleToUpdate =
      fromUpdateSharingRuleInputToFlatSharingRuleOrThrow({
        updateSharingRuleInput: input,
        existingFlatSharingRule: this.findExistingFlatSharingRuleOrThrow({
          id: input.id,
          flatSharingRuleMaps,
        }),
        flatRoleMaps,
      });

    await this.runSharingRuleMigrationOrThrow({
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      flatEntityToUpdate: [flatSharingRuleToUpdate],
      errorMessage:
        'Multiple validation errors occurred while updating sharing rule',
    });

    return this.findByIdOrThrow({ id: input.id, workspaceId });
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<SharingRuleDTO> {
    const [{ workspaceCustomFlatApplication }, { flatSharingRuleMaps }] =
      await Promise.all([
        this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        ),
        this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
          workspaceId,
          flatMapsKeys: ['flatSharingRuleMaps'],
        }),
      ]);

    const flatSharingRuleToDelete = this.findExistingFlatSharingRuleOrThrow({
      id,
      flatSharingRuleMaps,
    });

    await this.runSharingRuleMigrationOrThrow({
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      flatEntityToDelete: [flatSharingRuleToDelete],
      errorMessage:
        'Multiple validation errors occurred while deleting sharing rule',
    });

    return fromFlatSharingRuleToSharingRuleDto(flatSharingRuleToDelete);
  }

  private findExistingFlatSharingRuleOrThrow({
    id,
    flatSharingRuleMaps,
  }: {
    id: string;
    flatSharingRuleMaps: FlatSharingRuleMaps;
  }): FlatSharingRule {
    const existingFlatSharingRule = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatSharingRuleMaps,
    });

    if (
      !isDefined(existingFlatSharingRule) ||
      existingFlatSharingRule.deletedAt !== null
    ) {
      throw new SharingRuleException(
        'Sharing rule not found',
        SharingRuleExceptionCode.SHARING_RULE_NOT_FOUND,
      );
    }

    return existingFlatSharingRule;
  }

  private async findByIdOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<SharingRuleDTO> {
    const { flatSharingRuleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatSharingRuleMaps'] },
      );

    return fromFlatSharingRuleToSharingRuleDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: flatSharingRuleMaps,
      }),
    );
  }

  private async runSharingRuleMigrationOrThrow({
    workspaceId,
    applicationUniversalIdentifier,
    flatEntityToCreate = [],
    flatEntityToUpdate = [],
    flatEntityToDelete = [],
    errorMessage,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    flatEntityToCreate?: FlatSharingRule[];
    flatEntityToUpdate?: FlatSharingRule[];
    flatEntityToDelete?: FlatSharingRule[];
    errorMessage: string;
  }): Promise<void> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            sharingRule: {
              flatEntityToCreate,
              flatEntityToUpdate,
              flatEntityToDelete,
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        errorMessage,
      );
    }
  }
}
