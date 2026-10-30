import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
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
  rowLevelPermissionPredicateGroupId: z
    .uuid()
    .nullable()
    .optional()
    .describe('Id of the predicate group this predicate belongs to'),
  positionInRowLevelPermissionPredicateGroup: z
    .number()
    .nullable()
    .optional()
    .describe('Position of this predicate within its group'),
});

const rowLevelPermissionPredicateGroupSchema = z.object({
  id: z
    .uuid()
    .optional()
    .describe(
      'Group id. Pass an existing id to update a group, or a new client-generated UUID so predicates can reference the group via rowLevelPermissionPredicateGroupId.',
    ),
  logicalOperator: z
    .enum(RowLevelPermissionPredicateGroupLogicalOperator)
    .describe('How predicates inside this group are combined (AND / OR)'),
  parentRowLevelPermissionPredicateGroupId: z
    .uuid()
    .nullable()
    .optional()
    .describe('Parent group id for nested groups'),
  positionInRowLevelPermissionPredicateGroup: z
    .number()
    .nullable()
    .optional()
    .describe('Position of this group within its parent'),
});

const upsertRowLevelPermissionRulesInputSchema = z.object({
  roleId: z.uuid().describe('Id of the role the rules apply to'),
  objectMetadataId: z.uuid().describe('Id of the object the rules restrict'),
  predicates: z
    .array(rowLevelPermissionPredicateSchema)
    .describe(
      'The complete list of predicates to keep for this role and object. Existing predicates omitted from the list are deleted; pass an empty array to remove all rules.',
    ),
  predicateGroups: z
    .array(rowLevelPermissionPredicateGroupSchema)
    .describe(
      'The complete list of predicate groups to keep for this role and object. Existing groups omitted from the list are deleted.',
    ),
});

@DefineTool({
  name: 'upsert_row_level_permission_rules',
  category: ToolCategory.ROLE,
  requiredPermissionFlags: [PermissionFlagType.ROLES],
  description: `Set row-level permission rules restricting which records members with a role can see on a given object (enterprise feature).

Example, "members with this role only see records where the owner field matches the current user": pass one predicate with fieldMetadataId = the owner field on the object, operand = IS, and workspaceMemberFieldMetadataId = the "id" field of the workspaceMember object (resolved to the current user at query time). Use metadata tools to look up field ids.
The same works between relations: for "only records in my region", pass fieldMetadataId = a many-to-one relation on the object and workspaceMemberFieldMetadataId = a many-to-one relation on workspaceMember pointing at the same object, with operand IS.
Combine several predicates with predicateGroups (AND / OR): give each new group a client-generated UUID and reference it from predicates via rowLevelPermissionPredicateGroupId.
IMPORTANT: this replaces the full rule set for the role + object. Predicates or groups omitted from the lists are deleted; empty lists clear all rules. System-managed roles (like Admin) cannot be changed.`,
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
    const { predicates, predicateGroups } =
      await this.rowLevelPermissionPredicateService.upsertRowLevelPermissionPredicates(
        {
          workspaceId,
          input: {
            roleId: input.roleId,
            objectMetadataId: input.objectMetadataId,
            predicates: input.predicates,
            predicateGroups: input.predicateGroups.map((predicateGroup) => ({
              ...predicateGroup,
              objectMetadataId: input.objectMetadataId,
            })),
          },
        },
      );

    return {
      success: true,
      message: `Row-level permission rules updated (${predicates.length} predicate${predicates.length === 1 ? '' : 's'}, ${predicateGroups.length} group${predicateGroups.length === 1 ? '' : 's'})`,
      result: { predicates, predicateGroups },
    };
  }
}
