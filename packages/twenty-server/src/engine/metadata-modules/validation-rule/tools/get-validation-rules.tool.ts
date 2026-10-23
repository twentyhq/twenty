/* @license Enterprise */

import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { MetadataToolIdentifierService } from 'src/engine/metadata-modules/object-metadata/tools/services/metadata-tool-identifier.service';
import { type ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';
import { VALIDATION_RULE_OBJECT_NAME_DESCRIPTION } from 'src/engine/metadata-modules/validation-rule/tools/constants/validation-rule-object-name-description.constant';
import { ValidationRuleService } from 'src/engine/metadata-modules/validation-rule/validation-rule.service';

const getValidationRulesInputSchema = z.object({
  objectName: z.string().describe(VALIDATION_RULE_OBJECT_NAME_DESCRIPTION),
});

@DefineTool({
  name: 'get_validation_rules',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  requiredFeatureFlags: [FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED],
  icon: 'IconSettings',
  description:
    'List the validation rules of an object: conditions a record must meet to be saved.',
})
export class GetValidationRulesTool extends BaseTool<
  typeof getValidationRulesInputSchema
> {
  readonly inputSchema = getValidationRulesInputSchema;

  constructor(
    private readonly validationRuleService: ValidationRuleService,
    private readonly metadataToolIdentifierService: MetadataToolIdentifierService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof getValidationRulesInputSchema>): Promise<
    ToolOutput<ValidationRuleDTO[]>
  > {
    const validationRules =
      await this.validationRuleService.findByObjectMetadataId({
        objectMetadataId:
          await this.metadataToolIdentifierService.getObjectMetadataIdOrThrow({
            workspaceId,
            objectName: input.objectName,
          }),
        workspaceId,
      });

    return {
      success: true,
      message: `Found ${validationRules.length} validation rule(s).`,
      result: validationRules,
    };
  }
}
