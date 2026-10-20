/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatRecordInheritanceRule } from 'src/engine/metadata-modules/flat-record-inheritance-rule/types/flat-record-inheritance-rule.type';
import { fromCreateRecordInheritanceRuleInputToFlatRecordInheritanceRuleToCreateOrThrow } from 'src/engine/metadata-modules/flat-record-inheritance-rule/utils/from-create-record-inheritance-rule-input-to-flat-record-inheritance-rule-to-create-or-throw.util';
import { fromFlatRecordInheritanceRuleToRecordInheritanceRuleDto } from 'src/engine/metadata-modules/flat-record-inheritance-rule/utils/from-flat-record-inheritance-rule-to-record-inheritance-rule-dto.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type CreateRecordInheritanceRuleInput } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/create-record-inheritance-rule.input';
import { type RecordInheritanceRuleDTO } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/record-inheritance-rule.dto';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class RecordInheritanceRuleService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {}

  private getFlatMaps(workspaceId: string) {
    return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatRecordInheritanceRuleMaps',
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );
  }

  private async assertHasEntitlementOrThrow(
    workspaceId: string,
  ): Promise<void> {
    const hasEntitlement =
      await this.billingSubscriptionService.getWorkspaceEntitlementValue(
        workspaceId,
        BillingEntitlementKey.RLS,
      );

    if (!hasEntitlement) {
      throw new PermissionsException(
        'Record inheritance rules are not included in the workspace plan',
        PermissionsExceptionCode.INVALID_SETTING,
        {
          userFriendlyMessage: msg`Related records rules are part of the Organization plan.`,
        },
      );
    }
  }

  private async runMigration({
    workspaceId,
    flatEntityToCreate,
    flatEntityToDelete,
  }: {
    workspaceId: string;
    flatEntityToCreate: FlatRecordInheritanceRule[];
    flatEntityToDelete: FlatRecordInheritanceRule[];
  }): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            recordInheritanceRule: {
              flatEntityToCreate,
              flatEntityToUpdate: [],
              flatEntityToDelete,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        'Validation errors occurred while saving the record inheritance rule',
      );
    }
  }

  async findAll(workspaceId: string): Promise<RecordInheritanceRuleDTO[]> {
    const { flatRecordInheritanceRuleMaps } =
      await this.getFlatMaps(workspaceId);

    return Object.values(flatRecordInheritanceRuleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map(fromFlatRecordInheritanceRuleToRecordInheritanceRuleDto);
  }

  async create({
    input,
    workspaceId,
  }: {
    input: CreateRecordInheritanceRuleInput;
    workspaceId: string;
  }): Promise<RecordInheritanceRuleDTO> {
    await this.assertHasEntitlementOrThrow(workspaceId);

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.getFlatMaps(workspaceId);

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatRecordInheritanceRule =
      fromCreateRecordInheritanceRuleInputToFlatRecordInheritanceRuleToCreateOrThrow(
        {
          createRecordInheritanceRuleInput: input,
          workspaceId,
          flatApplication: workspaceCustomFlatApplication,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        },
      );

    await this.runMigration({
      workspaceId,
      flatEntityToCreate: [flatRecordInheritanceRule],
      flatEntityToDelete: [],
    });

    const { flatRecordInheritanceRuleMaps } =
      await this.getFlatMaps(workspaceId);

    return fromFlatRecordInheritanceRuleToRecordInheritanceRuleDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatRecordInheritanceRule.id,
        flatEntityMaps: flatRecordInheritanceRuleMaps,
      }),
    );
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<RecordInheritanceRuleDTO> {
    const { flatRecordInheritanceRuleMaps } =
      await this.getFlatMaps(workspaceId);

    const existingFlatRecordInheritanceRule =
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: id,
        flatEntityMaps: flatRecordInheritanceRuleMaps,
      });

    if (!isDefined(existingFlatRecordInheritanceRule)) {
      throw new PermissionsException(
        'Record inheritance rule not found',
        PermissionsExceptionCode.INVALID_SETTING,
        {
          userFriendlyMessage: msg`This related records rule no longer exists.`,
        },
      );
    }

    await this.runMigration({
      workspaceId,
      flatEntityToCreate: [],
      flatEntityToDelete: [existingFlatRecordInheritanceRule],
    });

    return fromFlatRecordInheritanceRuleToRecordInheritanceRuleDto(
      existingFlatRecordInheritanceRule,
    );
  }
}
