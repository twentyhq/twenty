import { ToolCategory } from 'twenty-shared/ai';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ROLE_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/role/constants/role-write-access-policy.constant';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';

const predicateValueSchema = z
  .union([
    z.string(),
    z.array(z.string()),
    z.boolean(),
    z.number(),
    z.record(z.string(), z.unknown()),
    z.null(),
  ])
  .optional()
  .describe(
    'Static value to compare the field against. Omit when using workspaceMemberFieldMetadataId or a value-less operand (IS_EMPTY, IS_IN_PAST, ...).',
  );

const rowLevelPermissionPredicateSchema = z.object({
  id: z
    .uuid()
    .optional()
    .describe(
      'Id of an existing predicate to update. Omit to create a new one.',
    ),
  fieldMetadataId: z
    .uuid()
    .describe('Id of the field (on the target object) the rule filters on'),
  operand: z
    .enum(RowLevelPermissionPredicateOperand)
    .describe('Comparison operator'),
  value: predicateValueSchema,
  subFieldName: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Sub-field for composite fields (e.g. "firstName" of a FULL_NAME field)',
    ),
  workspaceMemberFieldMetadataId: z
    .uuid()
    .nullable()
    .optional()
    .describe(
      'Dynamic comparison: id of a field on the workspaceMember object whose value for the CURRENT user is substituted at query time. Use the workspaceMember "id" field to express "matches the current user", or a many-to-one relation field to compare against a relation on the record pointing at the same object.',
    ),
  workspaceMemberSubFieldName: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Sub-field of the workspace member field when it is a composite field',
    ),
  position: z
    .number()
    .nullable()
    .optional()
    .describe('Position of this predicate within its rule or group'),
});

const rowLevelPermissionPredicateGroupFields = {
  id: z
    .uuid()
    .optional()
    .describe('Id of an existing group to update. Omit to create a new one.'),
  logicalOperator: z
    .enum(RowLevelPermissionPredicateGroupLogicalOperator)
    .describe('How the predicates and groups inside this group are combined'),
  position: z
    .number()
    .nullable()
    .optional()
    .describe('Position of this group within its rule or parent group'),
  predicates: z.array(rowLevelPermissionPredicateSchema).optional(),
};

const rowLevelPermissionPredicateGroupSchema = z.object({
  ...rowLevelPermissionPredicateGroupFields,
  predicateGroups: z
    .array(z.object(rowLevelPermissionPredicateGroupFields))
    .optional()
    .describe('Nested groups'),
});

const operationSchema = (description: string) =>
  z.boolean().optional().describe(description);

const rowLevelPermissionRuleSchema = z.object({
  id: z
    .uuid()
    .optional()
    .describe('Id of an existing rule to update. Omit to create a new one.'),
  canReadRecords: operationSchema(
    'Whether members with this role can read the records the rule matches',
  ),
  canCreateRecords: operationSchema(
    'Whether members with this role can create records the rule matches. Defaults to canUpdateRecords.',
  ),
  canUpdateRecords: operationSchema(
    'Whether members with this role can update the records the rule matches',
  ),
  canSoftDeleteRecords: operationSchema(
    'Whether members with this role can soft delete the records the rule matches',
  ),
  canDestroyRecords: operationSchema(
    'Whether members with this role can permanently delete the records the rule matches',
  ),
  predicates: z
    .array(rowLevelPermissionPredicateSchema)
    .optional()
    .describe('Predicates of the rule, combined with AND'),
  predicateGroups: z
    .array(rowLevelPermissionPredicateGroupSchema)
    .optional()
    .describe('Groups of predicates, to combine conditions with AND or OR'),
});

const upsertRowLevelPermissionRulesInputSchema = z.object({
  roleId: z.uuid().describe('Id of the role the rules apply to'),
  objectMetadataId: z.uuid().describe('Id of the object the rules restrict'),
  rules: z
    .array(rowLevelPermissionRuleSchema)
    .describe(
      'The complete list of rules to keep for this role and object. A record is open for an operation when any rule matching it grants that operation. Existing rules omitted from the list are deleted; pass an empty array to remove all rules.',
    ),
});

@DefineTool({
  name: 'upsert_row_level_permission_rules',
  isDestructive: true,
  category: ToolCategory.ROLE,
  accessPolicy: ROLE_WRITE_ACCESS_POLICY,
  description: `Set row-level permission rules restricting which records members with a role can see on a given object (enterprise feature).

Example, "members with this role only see records where the owner field matches the current user": pass one predicate with fieldMetadataId = the owner field on the object, operand = IS, and workspaceMemberFieldMetadataId = the "id" field of the workspaceMember object (resolved to the current user at query time). Use metadata tools to look up field ids.
The same works between relations: for "only records in my region", pass fieldMetadataId = a many-to-one relation on the object and workspaceMemberFieldMetadataId = a many-to-one relation on workspaceMember pointing at the same object, with operand IS.
Each rule has its own operations (canReadRecords, canUpdateRecords, ...) and its own conditions. Combine conditions with predicateGroups (AND / OR) nested in the rule.
An object-level permission granting all records on this object wins over the rules, so turn it off for the operations the rules should restrict.
IMPORTANT: this replaces the full rule set for the role + object. Rules, groups or predicates omitted are deleted; an empty rules list clears them all. System-managed roles (like Admin) cannot be changed.`,
})
export class UpsertRowLevelPermissionRulesTool extends BaseTool<
  typeof upsertRowLevelPermissionRulesInputSchema
> {
  readonly inputSchema = upsertRowLevelPermissionRulesInputSchema;

  constructor(
    private readonly rowLevelPermissionPredicateService: RowLevelPermissionPredicateService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof upsertRowLevelPermissionRulesInputSchema
  >): Promise<ToolOutput> {
    const { rules, predicates, predicateGroups } =
      await this.rowLevelPermissionPredicateService.upsertRowLevelPermissionRules(
        { workspaceId, input },
      );

    return {
      success: true,
      message: `Row-level permission rules updated (${rules.length} rule${rules.length === 1 ? '' : 's'})`,
      result: { rules, predicates, predicateGroups },
    };
  }
}
