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
import { MetadataToolIdentifierService } from 'src/engine/metadata-modules/object-metadata/tools/services/metadata-tool-identifier.service';
import { VALIDATION_RULE_OBJECT_NAME_DESCRIPTION } from 'src/engine/metadata-modules/validation-rule/tools/constants/validation-rule-object-name-description.constant';
import { ValidationRuleService } from 'src/engine/metadata-modules/validation-rule/validation-rule.service';

const validateValidationRuleExpressionInputSchema = z.object({
  objectName: z.string().describe(VALIDATION_RULE_OBJECT_NAME_DESCRIPTION),
  expression: z
    .string()
    .describe(VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION),
});

@DefineTool({
  name: 'validate_validation_rule_expression',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  requiredFeatureFlags: [FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED],
  icon: 'IconSettings',
  description:
    'Check a validation rule expression against an object without saving anything. An invalid expression is rejected with the reason.',
})
export class ValidateValidationRuleExpressionTool extends BaseTool<
  typeof validateValidationRuleExpressionInputSchema
> {
  readonly inputSchema = validateValidationRuleExpressionInputSchema;

  constructor(
    private readonly validationRuleService: ValidationRuleService,
    private readonly metadataToolIdentifierService: MetadataToolIdentifierService,
  ) {
    super();
  }

  async execute({
    input: { objectName, expression },
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof validateValidationRuleExpressionInputSchema
  >): Promise<ToolOutput> {
    await this.validationRuleService.validateExpressionOrThrow({
      objectMetadataId:
        await this.metadataToolIdentifierService.getObjectMetadataIdOrThrow({
          workspaceId,
          objectName,
        }),
      expression,
      workspaceId,
    });

    return { success: true, message: 'The expression is valid.' };
  }
}
