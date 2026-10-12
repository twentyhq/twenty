/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { getObjectMetadataIdByName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-object-metadata-id-by-name.util';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';
import { ValidationRuleService } from 'src/engine/metadata-modules/validation-rule/validation-rule.service';

const OBJECT_NAME_DESCRIPTION =
  'Object name, singular or plural (e.g. "company" or "companies").';

const MESSAGE_DESCRIPTION =
  'Message shown to the person saving the record when the expression is false.';

const GetValidationRulesInputSchema = z.object({
  objectName: z.string().describe(OBJECT_NAME_DESCRIPTION),
});

const ValidateValidationRuleExpressionInputSchema = z.object({
  objectName: z.string().describe(OBJECT_NAME_DESCRIPTION),
  expression: z
    .string()
    .describe(VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION),
});

const CreateValidationRuleInputSchema = z.object({
  objectName: z.string().describe(OBJECT_NAME_DESCRIPTION),
  name: z.string().describe('Short rule name'),
  expression: z
    .string()
    .describe(VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION),
  message: z.string().describe(MESSAGE_DESCRIPTION),
  errorFieldMetadataId: z
    .uuid()
    .optional()
    .describe(
      'ID of the field the message is shown on. Omit to show it on the whole record.',
    ),
});

const UpdateValidationRuleInputSchema = z.object({
  id: z.uuid().describe('Validation rule ID'),
  name: z.string().optional().describe('Short rule name'),
  expression: z
    .string()
    .optional()
    .describe(VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION),
  message: z.string().optional().describe(MESSAGE_DESCRIPTION),
  errorFieldMetadataId: z
    .uuid()
    .nullable()
    .optional()
    .describe(
      'ID of the field the message is shown on, or null to show it on the whole record.',
    ),
  isActive: z
    .boolean()
    .optional()
    .describe('Set false to turn the rule off without deleting it.'),
});

@Injectable()
export class ValidationRuleToolsFactory {
  constructor(
    private readonly validationRuleService: ValidationRuleService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private async getObjectMetadataIdOrThrow({
    workspaceId,
    objectName,
  }: {
    workspaceId: string;
    objectName: string;
  }): Promise<string> {
    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const objectMetadataId = getObjectMetadataIdByName({
      flatObjectMetadataMaps,
      objectName,
    });

    if (!isDefined(objectMetadataId)) {
      throw new ObjectMetadataException(
        `Object "${objectName}" not found. Use get_object_metadata to list available objects.`,
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    return objectMetadataId;
  }

  generateTools(workspaceId: string): ToolSet {
    return {
      get_validation_rules: {
        description:
          'List the validation rules of an object: conditions a record must meet to be saved.',
        inputSchema: GetValidationRulesInputSchema,
        execute: async (parameters: {
          objectName: string;
        }): Promise<ToolOutput<ValidationRuleDTO[]>> => {
          const validationRules =
            await this.validationRuleService.findByObjectMetadataId({
              objectMetadataId: await this.getObjectMetadataIdOrThrow({
                workspaceId,
                objectName: parameters.objectName,
              }),
              workspaceId,
            });

          return {
            success: true,
            message: `Found ${validationRules.length} validation rule(s).`,
            result: validationRules,
          };
        },
      },
      validate_validation_rule_expression: {
        description:
          'Check a validation rule expression against an object without saving anything. An invalid expression is rejected with the reason.',
        inputSchema: ValidateValidationRuleExpressionInputSchema,
        execute: async ({
          objectName,
          expression,
        }: {
          objectName: string;
          expression: string;
        }): Promise<ToolOutput> => {
          await this.validationRuleService.validateExpressionOrThrow({
            objectMetadataId: await this.getObjectMetadataIdOrThrow({
              workspaceId,
              objectName,
            }),
            expression,
            workspaceId,
          });

          return { success: true, message: 'The expression is valid.' };
        },
      },
      create_validation_rule: {
        description:
          'Create a validation rule on an object. An invalid expression is rejected with the reason. When the user is on a validation rule page (a settings path ending in /validation-rules/<id>), they mean that rule: update it with update_validation_rule instead of creating another one.',
        inputSchema: CreateValidationRuleInputSchema,
        execute: async ({
          objectName,
          ...input
        }: {
          objectName: string;
          name: string;
          expression: string;
          message: string;
          errorFieldMetadataId?: string;
        }): Promise<ToolOutput<ValidationRuleDTO>> => {
          const validationRule = await this.validationRuleService.create({
            input: {
              ...input,
              objectMetadataId: await this.getObjectMetadataIdOrThrow({
                workspaceId,
                objectName,
              }),
            },
            workspaceId,
          });

          return {
            success: true,
            message: `Created the validation rule "${validationRule.name}".`,
            result: validationRule,
          };
        },
      },
      update_validation_rule: {
        description:
          'Update a validation rule. Only the provided properties change. When the user is on a validation rule page (a settings path ending in /validation-rules/<id>), requests about a rule are about that one. An active rule rejects an invalid expression with the reason; an inactive rule only checks it when activated, so check it first with validate_validation_rule_expression. Keep the rule inactive unless the user asks to activate it.',
        inputSchema: UpdateValidationRuleInputSchema,
        execute: async ({
          id,
          ...update
        }: {
          id: string;
          name?: string;
          expression?: string;
          message?: string;
          errorFieldMetadataId?: string | null;
          isActive?: boolean;
        }): Promise<ToolOutput<ValidationRuleDTO>> => {
          const validationRule = await this.validationRuleService.update({
            input: { id, update },
            workspaceId,
          });

          return {
            success: true,
            message: `Updated the validation rule "${validationRule.name}".`,
            result: validationRule,
          };
        },
      },
    };
  }
}
