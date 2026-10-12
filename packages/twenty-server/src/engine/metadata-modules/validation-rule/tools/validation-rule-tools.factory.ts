import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION } from 'twenty-shared/constants';
import { z } from 'zod';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';
import { ValidationRuleService } from 'src/engine/metadata-modules/validation-rule/validation-rule.service';

const MESSAGE_DESCRIPTION =
  'Message shown to the person saving the record when the expression is false.';

const GetValidationRulesInputSchema = z.object({
  objectMetadataId: z.uuid().describe('Object ID'),
});

const ValidateValidationRuleExpressionInputSchema = z.object({
  objectMetadataId: z.uuid().describe('Object ID'),
  expression: z
    .string()
    .describe(VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION),
});

const CreateValidationRuleInputSchema = z.object({
  objectMetadataId: z.uuid().describe('Object ID'),
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
  constructor(private readonly validationRuleService: ValidationRuleService) {}

  generateTools(workspaceId: string): ToolSet {
    return {
      get_validation_rules: {
        description:
          'List the validation rules of an object: conditions a record must meet to be saved.',
        inputSchema: GetValidationRulesInputSchema,
        execute: async (parameters: {
          objectMetadataId: string;
        }): Promise<ToolOutput<ValidationRuleDTO[]>> => {
          const validationRules =
            await this.validationRuleService.findByObjectMetadataId({
              objectMetadataId: parameters.objectMetadataId,
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
        execute: async (parameters: {
          objectMetadataId: string;
          expression: string;
        }): Promise<ToolOutput> => {
          await this.validationRuleService.validateExpressionOrThrow({
            ...parameters,
            workspaceId,
          });

          return { success: true, message: 'The expression is valid.' };
        },
      },
      create_validation_rule: {
        description:
          'Create a validation rule on an object. An invalid expression is rejected with the reason.',
        inputSchema: CreateValidationRuleInputSchema,
        execute: async (parameters: {
          objectMetadataId: string;
          name: string;
          expression: string;
          message: string;
          errorFieldMetadataId?: string;
        }): Promise<ToolOutput<ValidationRuleDTO>> => {
          const validationRule = await this.validationRuleService.create({
            input: parameters,
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
          'Update a validation rule. Only the provided properties change. An invalid expression is rejected with the reason.',
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
