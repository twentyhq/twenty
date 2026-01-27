import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromCreateWebhookInputToFlatWebhookToCreate } from 'src/engine/metadata-modules/flat-webhook/utils/from-create-webhook-input-to-flat-webhook-to-create.util';
import { fromDeleteWebhookInputToFlatWebhookOrThrow } from 'src/engine/metadata-modules/flat-webhook/utils/from-delete-webhook-input-to-flat-webhook-or-throw.util';
import { fromFlatWebhookToWebhookDto } from 'src/engine/metadata-modules/flat-webhook/utils/from-flat-webhook-to-webhook-dto.util';
import { fromUpdateWebhookInputToFlatWebhookToUpdateOrThrow } from 'src/engine/metadata-modules/flat-webhook/utils/from-update-webhook-input-to-flat-webhook-to-update-or-throw.util';
import { type CreateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/create-webhook.input';
import { type UpdateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/update-webhook.input';
import { type WebhookDTO } from 'src/engine/metadata-modules/webhook/dtos/webhook.dto';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
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
        {
          workspaceId,
          flatMapsKeys: ['flatWebhookMaps'],
        },
      );

    return Object.values(flatWebhookMaps.byId)
      .filter(isDefined)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map(fromFlatWebhookToWebhookDto);
  }

  async findById(id: string, workspaceId: string): Promise<WebhookDTO | null> {
    const { flatWebhookMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatWebhookMaps'],
        },
      );

    const flatWebhook = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatWebhookMaps,
    });

    if (!isDefined(flatWebhook)) {
      return null;
    }

    return fromFlatWebhookToWebhookDto(flatWebhook);
  }

  async create(
    input: CreateWebhookInput,
    workspaceId: string,
  ): Promise<WebhookDTO> {
    const normalizedTargetUrl = this.normalizeTargetUrl(input.targetUrl);

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatWebhookToCreate = fromCreateWebhookInputToFlatWebhookToCreate({
      createWebhookInput: {
        ...input,
        targetUrl: normalizedTargetUrl,
      },
      workspaceId,
      applicationId: workspaceCustomFlatApplication.id,
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
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
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

  async update(
    input: UpdateWebhookInput,
    workspaceId: string,
  ): Promise<WebhookDTO> {
    if (isDefined(input.update.targetUrl)) {
      const normalizedTargetUrl = this.normalizeTargetUrl(
        input.update.targetUrl,
      );

      input.update.targetUrl = normalizedTargetUrl;
    }

    const { flatWebhookMaps: existingFlatWebhookMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatWebhookMaps'],
        },
      );

    const flatWebhookToUpdate =
      fromUpdateWebhookInputToFlatWebhookToUpdateOrThrow({
        flatWebhookMaps: existingFlatWebhookMaps,
        updateWebhookInput: input,
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
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
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
    const { flatWebhookMaps: existingFlatWebhookMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatWebhookMaps'],
        },
      );

    const flatWebhookToDelete = fromDeleteWebhookInputToFlatWebhookOrThrow({
      flatWebhookMaps: existingFlatWebhookMaps,
      webhookId: id,
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
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting webhook',
      );
    }

    return fromFlatWebhookToWebhookDto(flatWebhookToDelete);
  }
}
