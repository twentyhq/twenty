import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { fromCreateValidationRuleInputToFlatValidationRuleToCreate } from 'src/engine/metadata-modules/flat-validation-rule/utils/from-create-validation-rule-input-to-flat-validation-rule-to-create.util';
import { fromFlatValidationRuleToValidationRuleDto } from 'src/engine/metadata-modules/flat-validation-rule/utils/from-flat-validation-rule-to-validation-rule-dto.util';
import { fromUpdateValidationRuleInputToFlatValidationRuleToUpdate } from 'src/engine/metadata-modules/flat-validation-rule/utils/from-update-validation-rule-input-to-flat-validation-rule-to-update.util';
import { type CreateValidationRuleInput } from 'src/engine/metadata-modules/validation-rule/dtos/create-validation-rule.input';
import { type UpdateValidationRuleInput } from 'src/engine/metadata-modules/validation-rule/dtos/update-validation-rule.input';
import { type ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';
import { compileValidationRuleExpressionOrThrow } from 'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-expression-or-throw.util';
import {
  ValidationRuleException,
  ValidationRuleExceptionCode,
} from 'src/engine/metadata-modules/validation-rule/validation-rule.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type ValidationRuleOperation = {
  flatEntityToCreate: FlatValidationRule[];
  flatEntityToUpdate: FlatValidationRule[];
  flatEntityToDelete: FlatValidationRule[];
};

@Injectable()
export class ValidationRuleService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  private getFlatMaps(workspaceId: string) {
    return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatValidationRuleMaps',
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );
  }

  private async runValidationRuleMigration({
    workspaceId,
    operation,
    errorMessage,
  }: {
    workspaceId: string;
    operation: ValidationRuleOperation;
    errorMessage: string;
  }): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: { validationRule: operation },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        errorMessage,
      );
    }
  }

  private async findDtoByIdOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<ValidationRuleDTO> {
    const { flatValidationRuleMaps } = await this.getFlatMaps(workspaceId);

    return fromFlatValidationRuleToValidationRuleDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: flatValidationRuleMaps,
      }),
    );
  }

  private async findExistingFlatValidationRuleOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }) {
    const flatMaps = await this.getFlatMaps(workspaceId);

    const existingFlatValidationRule = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatMaps.flatValidationRuleMaps,
    });

    if (!isDefined(existingFlatValidationRule)) {
      throw new ValidationRuleException(
        'Validation rule not found',
        ValidationRuleExceptionCode.VALIDATION_RULE_NOT_FOUND,
      );
    }

    return { existingFlatValidationRule, flatMaps };
  }

  async findByObjectMetadataId({
    objectMetadataId,
    workspaceId,
  }: {
    objectMetadataId: string;
    workspaceId: string;
  }): Promise<ValidationRuleDTO[]> {
    const { flatValidationRuleMaps } = await this.getFlatMaps(workspaceId);

    return Object.values(flatValidationRuleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatValidationRule) =>
          flatValidationRule.objectMetadataId === objectMetadataId,
      )
      .sort(
        (left, right) =>
          left.createdAt.localeCompare(right.createdAt) ||
          left.id.localeCompare(right.id),
      )
      .map(fromFlatValidationRuleToValidationRuleDto);
  }

  async create({
    input,
    workspaceId,
  }: {
    input: CreateValidationRuleInput;
    workspaceId: string;
  }): Promise<ValidationRuleDTO> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.getFlatMaps(workspaceId);

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { expression, bindings } = compileValidationRuleExpressionOrThrow({
      expression: input.expression,
      bindings: input.bindings ?? {},
      objectMetadataId: input.objectMetadataId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const flatValidationRuleToCreate =
      fromCreateValidationRuleInputToFlatValidationRuleToCreate({
        createValidationRuleInput: input,
        expression,
        bindings,
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    await this.runValidationRuleMigration({
      workspaceId,
      operation: {
        flatEntityToCreate: [flatValidationRuleToCreate],
        flatEntityToUpdate: [],
        flatEntityToDelete: [],
      },
      errorMessage:
        'Multiple validation errors occurred while creating validation rule',
    });

    return this.findDtoByIdOrThrow({
      id: flatValidationRuleToCreate.id,
      workspaceId,
    });
  }

  async update({
    input,
    workspaceId,
  }: {
    input: UpdateValidationRuleInput;
    workspaceId: string;
  }): Promise<ValidationRuleDTO> {
    const {
      existingFlatValidationRule,
      flatMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
    } = await this.findExistingFlatValidationRuleOrThrow({
      id: input.id,
      workspaceId,
    });

    if (
      isDefined(input.update.bindings) &&
      !isDefined(input.update.expression)
    ) {
      throw new ValidationRuleException(
        'Bindings can only be sent with the expression whose symbols they resolve',
        ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_INPUT,
      );
    }

    const isActive =
      input.update.isActive ?? existingFlatValidationRule.isActive;
    const sourceExpression = isDefined(input.update.expression)
      ? {
          expression: input.update.expression,
          bindings:
            input.update.bindings ?? existingFlatValidationRule.bindings,
        }
      : {
          expression: existingFlatValidationRule.expression,
          bindings: existingFlatValidationRule.bindings,
        };
    const isSourceExpressionStored =
      sourceExpression.expression === existingFlatValidationRule.expression &&
      sourceExpression.bindings === existingFlatValidationRule.bindings;
    const shouldCompile =
      !isSourceExpressionStored ||
      (isActive && !existingFlatValidationRule.isActive);

    const compiledExpression = shouldCompile
      ? compileValidationRuleExpressionOrThrow({
          ...sourceExpression,
          objectMetadataId: existingFlatValidationRule.objectMetadataId,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        })
      : sourceExpression;

    const flatValidationRuleToUpdate =
      fromUpdateValidationRuleInputToFlatValidationRuleToUpdate({
        existingFlatValidationRule,
        update: input.update,
        compiledExpression,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    await this.runValidationRuleMigration({
      workspaceId,
      operation: {
        flatEntityToCreate: [],
        flatEntityToUpdate: [flatValidationRuleToUpdate],
        flatEntityToDelete: [],
      },
      errorMessage:
        'Multiple validation errors occurred while updating validation rule',
    });

    return this.findDtoByIdOrThrow({ id: input.id, workspaceId });
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<ValidationRuleDTO> {
    const { existingFlatValidationRule } =
      await this.findExistingFlatValidationRuleOrThrow({ id, workspaceId });

    await this.runValidationRuleMigration({
      workspaceId,
      operation: {
        flatEntityToCreate: [],
        flatEntityToUpdate: [],
        flatEntityToDelete: [existingFlatValidationRule],
      },
      errorMessage:
        'Multiple validation errors occurred while deleting validation rule',
    });

    return fromFlatValidationRuleToValidationRuleDto(
      existingFlatValidationRule,
    );
  }
}
