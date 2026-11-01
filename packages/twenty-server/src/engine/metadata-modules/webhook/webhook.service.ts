import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateWebhookInputToFlatWebhookToCreateOrThrow } from 'src/engine/metadata-modules/flat-webhook/utils/from-create-webhook-input-to-flat-webhook-to-create-or-throw.util';
import { fromDeleteWebhookInputToFlatWebhookOrThrow } from 'src/engine/metadata-modules/flat-webhook/utils/from-delete-webhook-input-to-flat-webhook-or-throw.util';
import { fromFlatWebhookToWebhookDto } from 'src/engine/metadata-modules/flat-webhook/utils/from-flat-webhook-to-webhook-dto.util';
import { fromUpdateWebhookInputToFlatWebhookToUpdateOrThrow } from 'src/engine/metadata-modules/flat-webhook/utils/from-update-webhook-input-to-flat-webhook-to-update-or-throw.util';
import { type CreateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/create-webhook.input';
import { type UpdateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/update-webhook.input';
import { type WebhookDTO } from 'src/engine/metadata-modules/webhook/dtos/webhook.dto';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { fromFlatRoleToRoleDto } from 'src/engine/metadata-modules/role/utils/fromFlatRoleToRoleDto.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { findFlatRoleTargetFromForeignKey } from 'src/engine/metadata-modules/flat-role-target/utils/find-flat-role-target-from-foreign-key.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  private normalizeTargetUrl(targetUrl: string): string {
    try {
      const url = new URL(targetUrl);

      return url.toString();
    } catch {
      return targetUrl;
    }
  }

  async findAll(workspaceId: string): Promise<WebhookDTO[]> {
    const { flatWebhookMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWebhookMaps'] },
      );

    return Object.values(flatWebhookMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort(
        (a, b) =>
          a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
      )
      .map(fromFlatWebhookToWebhookDto);
  }

  async findById(id: string, workspaceId: string): Promise<WebhookDTO | null> {
    const { flatWebhookMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWebhookMaps'] },
      );
    const webhook = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatWebhookMaps,
    });

    if (!isDefined(webhook)) {
      return null;
    }

    return fromFlatWebhookToWebhookDto(webhook);
  }

  async findRoleByWebhookId({
    webhookId,
    workspaceId,
  }: {
    webhookId: string;
    workspaceId: string;
  }): Promise<RoleDTO | null> {
    const { flatRoleTargetMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleTargetMaps',
        'flatRoleMaps',
      ]);

    const flatRoleTarget = findFlatRoleTargetFromForeignKey({
      flatRoleTargetMaps,
      targetMetadataForeignKey: 'webhookId',
      targetId: webhookId,
    });

    if (!isDefined(flatRoleTarget)) {
      return null;
    }

    return fromFlatRoleToRoleDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatRoleTarget.roleId,
        flatEntityMaps: flatRoleMaps,
      }),
    );
  }

  async create({
    input,
    workspaceId,
  }: {
    input: CreateWebhookInput;
    workspaceId: string;
  }): Promise<WebhookDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatRoleTargetMaps, flatRoleMaps, flatAgentMaps, flatWebhookMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatRoleTargetMaps',
            'flatRoleMaps',
            'flatAgentMaps',
            'flatWebhookMaps',
          ],
        },
      );

    const { flatWebhookToCreate, flatRoleTargetsToCreate } =
      fromCreateWebhookInputToFlatWebhookToCreateOrThrow({
        createWebhookInput: {
          ...input,
          targetUrl: this.normalizeTargetUrl(input.targetUrl),
        },
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatRoleTargetMaps,
        flatRoleMaps,
        flatAgentMaps,
        flatWebhookMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            webhook: {
              flatEntityToCreate: [flatWebhookToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            roleTarget: {
              flatEntityToCreate: flatRoleTargetsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating webhook',
      );
    }

    const { flatWebhookMaps: recomputedFlatWebhookMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatWebhookMaps'],
        },
      );

    return fromFlatWebhookToWebhookDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatWebhookToCreate.id,
        flatEntityMaps: recomputedFlatWebhookMaps,
      }),
    );
  }

  async update({
    input,
    workspaceId,
  }: {
    input: UpdateWebhookInput;
    workspaceId: string;
  }): Promise<WebhookDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const normalizedInput = {
      ...input,
      update: {
        ...input.update,
        ...(isDefined(input.update.targetUrl) && {
          targetUrl: this.normalizeTargetUrl(input.update.targetUrl),
        }),
      },
    };

    const { flatWebhookMaps, flatRoleTargetMaps, flatRoleMaps, flatAgentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatWebhookMaps',
            'flatRoleTargetMaps',
            'flatRoleMaps',
            'flatAgentMaps',
          ],
        },
      );

    const {
      flatWebhookToUpdate,
      flatRoleTargetsToCreate,
      flatRoleTargetsToDelete,
    } = fromUpdateWebhookInputToFlatWebhookToUpdateOrThrow({
      updateWebhookInput: normalizedInput,
      workspaceId,
      flatApplication: workspaceCustomFlatApplication,
      flatRoleTargetMaps,
      flatRoleMaps,
      flatAgentMaps,
      flatWebhookMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            webhook: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatWebhookToUpdate],
            },
            roleTarget: {
              flatEntityToCreate: flatRoleTargetsToCreate,
              flatEntityToDelete: flatRoleTargetsToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating webhook',
      );
    }

    const { flatWebhookMaps: recomputedFlatWebhookMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatWebhookMaps'],
        },
      );

    return fromFlatWebhookToWebhookDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: input.id,
        flatEntityMaps: recomputedFlatWebhookMaps,
      }),
    );
  }

  async delete(id: string, workspaceId: string): Promise<WebhookDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatWebhookMaps: existingFlatWebhookMaps, flatRoleTargetMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatWebhookMaps', 'flatRoleTargetMaps'],
        },
      );

    const flatWebhookToDelete = fromDeleteWebhookInputToFlatWebhookOrThrow({
      flatWebhookMaps: existingFlatWebhookMaps,
      webhookId: id,
    });

    const flatRoleTargetToDelete = findFlatRoleTargetFromForeignKey({
      flatRoleTargetMaps,
      targetMetadataForeignKey: 'webhookId',
      targetId: flatWebhookToDelete.id,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            webhook: {
              flatEntityToCreate: [],
              flatEntityToDelete: [flatWebhookToDelete],
              flatEntityToUpdate: [],
            },
            roleTarget: {
              flatEntityToCreate: [],
              flatEntityToDelete: isDefined(flatRoleTargetToDelete)
                ? [flatRoleTargetToDelete]
                : [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting webhook',
      );
    }

    return fromFlatWebhookToWebhookDto(flatWebhookToDelete);
  }
}
