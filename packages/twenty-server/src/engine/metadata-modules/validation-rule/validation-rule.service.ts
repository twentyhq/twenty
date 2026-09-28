import { Injectable } from '@nestjs/common';
import { type ObjectValidationRule } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type CreateValidationRuleInput } from 'src/engine/metadata-modules/validation-rule/dtos/create-validation-rule.input';
import { type UpdateValidationRuleInput } from 'src/engine/metadata-modules/validation-rule/dtos/update-validation-rule.input';
import { type ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';
import { compileValidationRuleExpressionOrThrow } from 'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-expression-or-throw.util';
import { fromObjectValidationRuleToValidationRuleDto } from 'src/engine/metadata-modules/validation-rule/utils/from-object-validation-rule-to-validation-rule-dto.util';
import {
  ValidationRuleException,
  ValidationRuleExceptionCode,
} from 'src/engine/metadata-modules/validation-rule/validation-rule.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const VALIDATION_RULE_LOCK_MAX_ATTEMPTS = 50;
const VALIDATION_RULE_LOCK_RETRY_DELAY_MS = 200;

type ValidationRuleFlatMaps = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
};

const getObjectValidationRules = (
  flatObjectMetadata: FlatObjectMetadata,
): ObjectValidationRule[] => flatObjectMetadata.validationRules ?? [];

@Injectable()
export class ValidationRuleService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
  ) {}

  private getFlatMaps(workspaceId: string): Promise<ValidationRuleFlatMaps> {
    return this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
      },
    );
  }

  private findFlatObjectMetadataOrThrow({
    objectMetadataId,
    flatObjectMetadataMaps,
  }: {
    objectMetadataId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): FlatObjectMetadata {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new ValidationRuleException(
        'Validation rule object not found',
        ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_INPUT,
      );
    }

    return flatObjectMetadata;
  }

  private findOwningFlatObjectMetadataOrThrow({
    validationRuleId,
    flatObjectMetadataMaps,
  }: {
    validationRuleId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): FlatObjectMetadata {
    const flatObjectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find((candidate) =>
        getObjectValidationRules(candidate).some(
          (validationRule) => validationRule.id === validationRuleId,
        ),
      );

    if (!isDefined(flatObjectMetadata)) {
      throw new ValidationRuleException(
        'Validation rule not found',
        ValidationRuleExceptionCode.VALIDATION_RULE_NOT_FOUND,
      );
    }

    return flatObjectMetadata;
  }

  private assertErrorFieldBelongsToObject({
    errorFieldMetadataId,
    flatObjectMetadata,
  }: {
    errorFieldMetadataId: string | null;
    flatObjectMetadata: FlatObjectMetadata;
  }): void {
    if (
      isDefined(errorFieldMetadataId) &&
      !flatObjectMetadata.fieldIds.includes(errorFieldMetadataId)
    ) {
      throw new ValidationRuleException(
        "Validation rule error field must belong to the rule's object",
        ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_INPUT,
      );
    }
  }

  private async writeValidationRules({
    workspaceId,
    flatObjectMetadata,
    validationRules,
    errorMessage,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    validationRules: ObjectValidationRule[];
    errorMessage: string;
  }): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [{ ...flatObjectMetadata, validationRules }],
            },
          },
          workspaceId,
          isSystemBuild: false,
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

  private async withObjectLock<T>(
    {
      workspaceId,
      objectMetadataId,
    }: { workspaceId: string; objectMetadataId: string },
    work: () => Promise<T>,
  ): Promise<T> {
    const lockName = `validation-rules:${workspaceId}:${objectMetadataId}`;

    for (
      let attempt = 0;
      attempt < VALIDATION_RULE_LOCK_MAX_ATTEMPTS;
      attempt++
    ) {
      const lockResult = await this.postgresAdvisoryLockService.tryWithLock(
        lockName,
        work,
      );

      if (lockResult.acquired) {
        return lockResult.value;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, VALIDATION_RULE_LOCK_RETRY_DELAY_MS),
      );
    }

    throw new ValidationRuleException(
      `Could not lock the validation rules of object ${objectMetadataId}`,
      ValidationRuleExceptionCode.VALIDATION_RULE_CHANGE_IN_PROGRESS,
    );
  }

  async findByObjectMetadataId(
    objectMetadataId: string,
    workspaceId: string,
  ): Promise<ValidationRuleDTO[]> {
    const { flatObjectMetadataMaps } = await this.getFlatMaps(workspaceId);

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return [];
    }

    return getObjectValidationRules(flatObjectMetadata).map((validationRule) =>
      fromObjectValidationRuleToValidationRuleDto({
        objectMetadataId,
        validationRule,
      }),
    );
  }

  async create(
    input: CreateValidationRuleInput,
    workspaceId: string,
  ): Promise<ValidationRuleDTO> {
    return this.withObjectLock(
      { workspaceId, objectMetadataId: input.objectMetadataId },
      async () => {
        const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
          await this.getFlatMaps(workspaceId);

        const flatObjectMetadata = this.findFlatObjectMetadataOrThrow({
          objectMetadataId: input.objectMetadataId,
          flatObjectMetadataMaps,
        });

        const errorFieldMetadataId = input.errorFieldMetadataId ?? null;

        this.assertErrorFieldBelongsToObject({
          errorFieldMetadataId,
          flatObjectMetadata,
        });

        const validationRule: ObjectValidationRule = {
          id: v4(),
          name: input.name,
          description: input.description ?? null,
          icon: input.icon ?? null,
          expression: input.expression,
          bindings: compileValidationRuleExpressionOrThrow({
            expression: input.expression,
            objectMetadataId: flatObjectMetadata.id,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          }),
          message: input.message,
          errorFieldMetadataId,
          isActive: input.isActive ?? true,
        };

        await this.writeValidationRules({
          workspaceId,
          flatObjectMetadata,
          validationRules: [
            ...getObjectValidationRules(flatObjectMetadata),
            validationRule,
          ],
          errorMessage:
            'Multiple validation errors occurred while creating validation rule',
        });

        return fromObjectValidationRuleToValidationRuleDto({
          objectMetadataId: flatObjectMetadata.id,
          validationRule,
        });
      },
    );
  }

  async update(
    input: UpdateValidationRuleInput,
    workspaceId: string,
  ): Promise<ValidationRuleDTO> {
    const { flatObjectMetadataMaps: lookupFlatObjectMetadataMaps } =
      await this.getFlatMaps(workspaceId);

    const { id: objectMetadataId } = this.findOwningFlatObjectMetadataOrThrow({
      validationRuleId: input.id,
      flatObjectMetadataMaps: lookupFlatObjectMetadataMaps,
    });

    return this.withObjectLock({ workspaceId, objectMetadataId }, async () => {
      const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
        await this.getFlatMaps(workspaceId);

      const flatObjectMetadata = this.findOwningFlatObjectMetadataOrThrow({
        validationRuleId: input.id,
        flatObjectMetadataMaps,
      });

      const existingValidationRules =
        getObjectValidationRules(flatObjectMetadata);
      const existingValidationRule = existingValidationRules.find(
        (validationRule) => validationRule.id === input.id,
      );

      if (!isDefined(existingValidationRule)) {
        throw new ValidationRuleException(
          'Validation rule not found',
          ValidationRuleExceptionCode.VALIDATION_RULE_NOT_FOUND,
        );
      }

      const expression =
        input.update.expression ?? existingValidationRule.expression;
      const errorFieldMetadataId =
        input.update.errorFieldMetadataId === undefined
          ? existingValidationRule.errorFieldMetadataId
          : input.update.errorFieldMetadataId;

      this.assertErrorFieldBelongsToObject({
        errorFieldMetadataId,
        flatObjectMetadata,
      });

      const isActive = input.update.isActive ?? existingValidationRule.isActive;
      const shouldCompile =
        expression !== existingValidationRule.expression ||
        (isActive && !existingValidationRule.isActive);

      const updatedValidationRule: ObjectValidationRule = {
        ...existingValidationRule,
        name: input.update.name ?? existingValidationRule.name,
        description:
          input.update.description === undefined
            ? existingValidationRule.description
            : input.update.description,
        icon:
          input.update.icon === undefined
            ? existingValidationRule.icon
            : input.update.icon,
        expression,
        bindings: shouldCompile
          ? compileValidationRuleExpressionOrThrow({
              expression,
              objectMetadataId: flatObjectMetadata.id,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
            })
          : existingValidationRule.bindings,
        message: input.update.message ?? existingValidationRule.message,
        errorFieldMetadataId,
        isActive,
      };

      await this.writeValidationRules({
        workspaceId,
        flatObjectMetadata,
        validationRules: existingValidationRules.map((validationRule) =>
          validationRule.id === input.id
            ? updatedValidationRule
            : validationRule,
        ),
        errorMessage:
          'Multiple validation errors occurred while updating validation rule',
      });

      return fromObjectValidationRuleToValidationRuleDto({
        objectMetadataId: flatObjectMetadata.id,
        validationRule: updatedValidationRule,
      });
    });
  }

  async delete(id: string, workspaceId: string): Promise<ValidationRuleDTO> {
    const { flatObjectMetadataMaps: lookupFlatObjectMetadataMaps } =
      await this.getFlatMaps(workspaceId);

    const { id: objectMetadataId } = this.findOwningFlatObjectMetadataOrThrow({
      validationRuleId: id,
      flatObjectMetadataMaps: lookupFlatObjectMetadataMaps,
    });

    return this.withObjectLock({ workspaceId, objectMetadataId }, async () => {
      const { flatObjectMetadataMaps } = await this.getFlatMaps(workspaceId);

      const flatObjectMetadata = this.findOwningFlatObjectMetadataOrThrow({
        validationRuleId: id,
        flatObjectMetadataMaps,
      });

      const existingValidationRules =
        getObjectValidationRules(flatObjectMetadata);
      const deletedValidationRule = existingValidationRules.find(
        (validationRule) => validationRule.id === id,
      );

      if (!isDefined(deletedValidationRule)) {
        throw new ValidationRuleException(
          'Validation rule not found',
          ValidationRuleExceptionCode.VALIDATION_RULE_NOT_FOUND,
        );
      }

      await this.writeValidationRules({
        workspaceId,
        flatObjectMetadata,
        validationRules: existingValidationRules.filter(
          (validationRule) => validationRule.id !== id,
        ),
        errorMessage:
          'Multiple validation errors occurred while deleting validation rule',
      });

      return fromObjectValidationRuleToValidationRuleDto({
        objectMetadataId: flatObjectMetadata.id,
        validationRule: deletedValidationRule,
      });
    });
  }
}
