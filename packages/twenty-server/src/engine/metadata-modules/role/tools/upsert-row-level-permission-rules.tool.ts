import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { z } from 'zod';

import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';
import { assertRowLevelRuleOwnership } from 'src/engine/metadata-modules/role/tools/utils/assert-row-level-rule-ownership.util';
import {
  assertRoleIsEditable,
  findFlatRoleForToolOrThrow,
} from 'src/engine/metadata-modules/role/tools/utils/role-tool-safeguards.util';
import { toRoleToolErrorMessage } from 'src/engine/metadata-modules/role/tools/utils/to-role-tool-error-message.util';

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
      'Dynamic comparison: id of a field on the workspaceMember object whose value for the CURRENT user is substituted at query time. Use the workspaceMember "id" field to express "matches the current user".',
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

const upsertRowLevelPermissionRulesSchema = z.object({
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

type UpsertRowLevelPermissionRulesParams = z.infer<
  typeof upsertRowLevelPermissionRulesSchema
>;

export const createUpsertRowLevelPermissionRulesTool = (
  deps: Pick<
    RoleToolDependencies,
    'rowLevelPermissionPredicateService' | 'flatEntityMapsCacheService'
  >,
  context: RoleToolContext,
) => ({
  name: 'upsert_row_level_permission_rules' as const,
  description: `Set row-level permission rules restricting which records members with a role can see on a given object (enterprise feature).

Example, "members with this role only see records where the owner field matches the current user": pass one predicate with fieldMetadataId = the owner field on the object, operand = IS, and workspaceMemberFieldMetadataId = the "id" field of the workspaceMember object (resolved to the current user at query time). Use metadata tools to look up field ids.
Combine several predicates with predicateGroups (AND / OR): give each new group a client-generated UUID and reference it from predicates via rowLevelPermissionPredicateGroupId.
IMPORTANT: this replaces the full rule set for the role + object. Predicates or groups omitted from the lists are deleted; empty lists clear all rules. System-managed roles (like Admin) cannot be changed.`,
  inputSchema: upsertRowLevelPermissionRulesSchema,
  execute: async (parameters: UpsertRowLevelPermissionRulesParams) => {
    try {
      const {
        flatRoleMaps,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      } =
        await deps.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId: context.workspaceId,
            flatMapsKeys: [
              'flatRoleMaps',
              'flatRowLevelPermissionPredicateMaps',
              'flatRowLevelPermissionPredicateGroupMaps',
              'flatFieldMetadataMaps',
              'flatObjectMetadataMaps',
            ],
          },
        );

      const flatRole = findFlatRoleForToolOrThrow({
        roleId: parameters.roleId,
        flatRoleMaps,
      });

      assertRoleIsEditable(flatRole);
      assertRowLevelRuleOwnership({
        roleId: parameters.roleId,
        objectMetadataId: parameters.objectMetadataId,
        predicates: parameters.predicates,
        predicateGroups: parameters.predicateGroups,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        flatFieldMetadataMaps,
        workspaceMemberObjectMetadataId: buildObjectIdByNameMaps(
          flatObjectMetadataMaps,
        ).idByNameSingular.workspaceMember,
      });

      const { predicates, predicateGroups } =
        await deps.rowLevelPermissionPredicateService.upsertRowLevelPermissionPredicates(
          {
            workspaceId: context.workspaceId,
            input: {
              roleId: parameters.roleId,
              objectMetadataId: parameters.objectMetadataId,
              predicates: parameters.predicates,
              predicateGroups: parameters.predicateGroups.map(
                (predicateGroup) => ({
                  ...predicateGroup,
                  objectMetadataId: parameters.objectMetadataId,
                }),
              ),
            },
          },
        );

      return {
        success: true,
        message: `Row-level permission rules updated on role "${flatRole.label}" (${predicates.length} predicate${predicates.length === 1 ? '' : 's'}, ${predicateGroups.length} group${predicateGroups.length === 1 ? '' : 's'})`,
        result: { predicates, predicateGroups },
      };
    } catch (error) {
      const message = toRoleToolErrorMessage(error);

      return {
        success: false,
        message: `Failed to upsert row-level permission rules: ${message}`,
        error: message,
      };
    }
  },
});
