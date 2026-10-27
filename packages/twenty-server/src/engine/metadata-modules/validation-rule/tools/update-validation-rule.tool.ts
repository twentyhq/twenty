/* @license Enterprise */

import { ToolCategory } from 'twenty-shared/ai';
import {
  PermissionFlagType,
  VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION,
} from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';
import { VALIDATION_RULE_MESSAGE_DESCRIPTION } from 'src/engine/metadata-modules/validation-rule/tools/constants/validation-rule-message-description.constant';
import { ValidationRuleService } from 'src/engine/metadata-modules/validation-rule/validation-rule.service';

const updateValidationRuleInputSchema = z.object({
  id: z.uuid().describe('Validation rule ID'),
  name: z.string().optional().describe('Short rule name'),
  expression: z
    .string()
    .optional()
    .describe(VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION),
  message: z.string().optional().describe(VALIDATION_RULE_MESSAGE_DESCRIPTION),
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

@DefineTool({
  name: 'update_validation_rule',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  requiredFeatureFlags: [FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED],
  icon: 'IconSettings',
  description:
    'Update a validation rule. Only the provided properties change. When the user is on a validation rule page (a settings path ending in /validation-rules/<id>), requests about a rule are about that one. An active rule rejects an invalid expression with the reason; an inactive rule only checks it when activated, so check it first with validate_validation_rule_expression. Keep the rule inactive unless the user asks to activate it.',
})
export class UpdateValidationRuleTool extends BaseTool<
  typeof updateValidationRuleInputSchema
> {
  readonly inputSchema = updateValidationRuleInputSchema;

  constructor(private readonly validationRuleService: ValidationRuleService) {
    super();
  }

  async execute({
    input: { id, ...update },
    context: { workspaceId },
  }: ToolExecuteArgs<typeof updateValidationRuleInputSchema>): Promise<
    ToolOutput<ValidationRuleDTO>
  > {
    const validationRule = await this.validationRuleService.update({
      input: { id, update },
      workspaceId,
    });

    return {
      success: true,
      message: `Updated the validation rule "${validationRule.name}".`,
      result: validationRule,
    };
  }
}
