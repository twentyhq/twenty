import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { z } from 'zod';

import { ValidationRuleService } from 'src/engine/metadata-modules/validation-rule/validation-rule.service';

const EXPRESSION_DESCRIPTION = [
  'Condition that must be true for a record to be saved. When it is false, the write is rejected and the message is shown.',
  'Reference fields by name, as returned by get_field_metadata. Use dot access for a composite field part (amount.amountMicros, name.firstName) and for a field of a many-to-one related record (company.name), never brackets.',
  "Compare select and multi-select fields with option values, e.g. stage == 'CUSTOMER'. Currency amounts are in micros: amount.amountMicros > 1000000000 means more than 1000.",
  'Write text in single quotes. Operators: == != < <= > >= + - * / and or not, and value in [a, b]. now is the date and time of the write; true and false are booleans.',
  'Functions: isDefined(value) is true when the value is set, even to an empty text; isEmpty(value) is true when the value is not set, an empty text, an empty list, or a composite field with every part empty; isNonEmptyString(value); includes(listOrText, value) is true when a multi-select or array contains the value, or a text contains a text, case-sensitive; arrayLength(list).',
  'To require a field, use not isEmpty(field).',
].join(' ');

const MESSAGE_DESCRIPTION =
  'Message shown to the person saving the record when the expression is false.';

const GetValidationRulesInputSchema = z.object({
  objectMetadataId: z.uuid().describe('Object ID'),
});

const CreateValidationRuleInputSchema = z.object({
  objectMetadataId: z.uuid().describe('Object ID'),
  name: z.string().describe('Short rule name'),
  expression: z.string().describe(EXPRESSION_DESCRIPTION),
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
  expression: z.string().optional().describe(EXPRESSION_DESCRIPTION),
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

const FillValidationRuleFormInputSchema = z.object({
  objectMetadataId: z.uuid().describe('Object ID'),
  validationRuleId: z
    .uuid()
    .optional()
    .describe('ID of the rule being edited. Omit on the new rule page.'),
  name: z.string().describe('Short rule name'),
  expression: z.string().describe(EXPRESSION_DESCRIPTION),
  message: z.string().describe(MESSAGE_DESCRIPTION),
  errorFieldMetadataId: z
    .uuid()
    .nullable()
    .optional()
    .describe(
      'ID of the field the message is shown on, or null to show it on the whole record.',
    ),
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
        execute: async (parameters: { objectMetadataId: string }) =>
          this.validationRuleService.findByObjectMetadataId({
            objectMetadataId: parameters.objectMetadataId,
            workspaceId,
          }),
      },
      create_validation_rule: {
        description:
          'Create a validation rule on an object. An invalid expression is rejected with the reason. Do not use it when the user is on a validation rule page: propose the values with fill_validation_rule_form instead.',
        inputSchema: CreateValidationRuleInputSchema,
        execute: async (parameters: {
          objectMetadataId: string;
          name: string;
          expression: string;
          message: string;
          errorFieldMetadataId?: string;
        }) =>
          this.validationRuleService.create({
            input: parameters,
            workspaceId,
          }),
      },
      update_validation_rule: {
        description:
          'Update a validation rule. Only the provided properties change. An invalid expression is rejected with the reason. Do not use it when the user is on a validation rule page: propose the values with fill_validation_rule_form instead.',
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
        }) =>
          this.validationRuleService.update({
            input: { id, update },
            workspaceId,
          }),
      },
      fill_validation_rule_form: {
        description:
          'Propose values for the validation rule form the user has open in settings, without saving anything. When the user is on a validation rule page, use this instead of create_validation_rule or update_validation_rule: the user applies the values to their form from the chat, reviews them and saves. An invalid expression is rejected with the reason.',
        inputSchema: FillValidationRuleFormInputSchema,
        execute: async (parameters: {
          objectMetadataId: string;
          validationRuleId?: string;
          name: string;
          expression: string;
          message: string;
          errorFieldMetadataId?: string | null;
        }) => {
          await this.validationRuleService.validateExpressionOrThrow({
            expression: parameters.expression,
            objectMetadataId: parameters.objectMetadataId,
            workspaceId,
          });

          return {
            success: true,
            message:
              'The values are shown in the chat with an Apply to form button. Nothing is saved until the user applies them and clicks Save.',
            result: parameters,
          };
        },
      },
    };
  }
}
