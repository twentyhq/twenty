import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type CurrencyMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';

export const OPPORTUNITY_OBJECT_NAME_SINGULAR = 'opportunity';
export const FARM_PROPERTY_VALUE_FIELD_NAME = 'farmPropertyValue';
export const LOAN_TO_VALUE_RATIO_FIELD_NAME = 'loanToValueRatio';

// Percentage NUMBER fields store the raw fraction (0.5, not 50) - the UI
// multiplies by 100 at display time - so this rounds the fraction itself.
const RATIO_ROUNDING_FACTOR = 1_000_000;

@Injectable()
export class OpportunityLoanToValueRatioService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  validateLoanToValueInputsOrThrow(
    loanAmount: CurrencyMetadata | null | undefined,
    farmPropertyValue: CurrencyMetadata | null | undefined,
  ): void {
    if (isDefined(loanAmount) && loanAmount.amountMicros < 0) {
      throw new CommonQueryRunnerException(
        'Loan amount cannot be negative',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        { userFriendlyMessage: msg`Loan Amount cannot be negative.` },
      );
    }

    if (isDefined(farmPropertyValue) && farmPropertyValue.amountMicros < 0) {
      throw new CommonQueryRunnerException(
        'Farm property value cannot be negative',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        { userFriendlyMessage: msg`Farm Property Value cannot be negative.` },
      );
    }
  }

  calculateLoanToValueRatio(
    loanAmount: CurrencyMetadata | null | undefined,
    farmPropertyValue: CurrencyMetadata | null | undefined,
  ): number | null {
    if (
      !isDefined(loanAmount) ||
      !isDefined(farmPropertyValue) ||
      farmPropertyValue.amountMicros === 0
    ) {
      return null;
    }

    const ratio = loanAmount.amountMicros / farmPropertyValue.amountMicros;

    return Math.round(ratio * RATIO_ROUNDING_FACTOR) / RATIO_ROUNDING_FACTOR;
  }

  async areLoanToValueFieldsEnabled(workspaceId: string): Promise<boolean> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );
    const objectId = idByNameSingular[OPPORTUNITY_OBJECT_NAME_SINGULAR];
    const objectMetadata = objectId
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: objectId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;

    if (!isDefined(objectMetadata)) {
      return false;
    }

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      objectMetadata,
    );

    return (
      isDefined(fieldIdByName[FARM_PROPERTY_VALUE_FIELD_NAME]) &&
      isDefined(fieldIdByName[LOAN_TO_VALUE_RATIO_FIELD_NAME])
    );
  }

  async getExistingLoanAmountAndFarmPropertyValue({
    workspaceId,
    opportunityId,
  }: {
    workspaceId: string;
    opportunityId: string;
  }): Promise<{
    loanAmount: CurrencyMetadata | null;
    farmPropertyValue: CurrencyMetadata | null;
  }> {
    // System auth context + bypass: this is an internal lookup to support the
    // ratio calculation, not the user's own query - the user's permissions
    // were already enforced for the mutation this hook is running inside of.
    const systemAuthContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const opportunityRepository =
          await this.globalWorkspaceOrmManager.getRepository<OpportunityWorkspaceEntity>(
            workspaceId,
            OPPORTUNITY_OBJECT_NAME_SINGULAR,
            { shouldBypassPermissionChecks: true },
          );

        const existingOpportunity = await opportunityRepository.findOne({
          where: { id: opportunityId },
        });

        return {
          loanAmount: existingOpportunity?.amount ?? null,
          farmPropertyValue:
            (
              existingOpportunity as unknown as {
                farmPropertyValue: CurrencyMetadata | null;
              }
            )?.farmPropertyValue ?? null,
        };
      },
      systemAuthContext,
    );
  }
}
