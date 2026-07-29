import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { createAssignRoleToWorkspaceMemberTool } from 'src/engine/metadata-modules/role/tools/assign-role-to-workspace-member.tool';
import { createCreateRoleTool } from 'src/engine/metadata-modules/role/tools/create-role.tool';
import { createDeleteRoleTool } from 'src/engine/metadata-modules/role/tools/delete-role.tool';
import { createListRolesTool } from 'src/engine/metadata-modules/role/tools/list-roles.tool';
import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';
import { createUpdateRoleTool } from 'src/engine/metadata-modules/role/tools/update-role.tool';
import { createUpsertObjectPermissionsTool } from 'src/engine/metadata-modules/role/tools/upsert-object-permissions.tool';
import { createUpsertRowLevelPermissionRulesTool } from 'src/engine/metadata-modules/role/tools/upsert-row-level-permission-rules.tool';
import { RowLevelPermissionPredicateGroupService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate-group.service';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

@Injectable()
export class RoleToolWorkspaceService {
  private readonly deps: RoleToolDependencies;

  constructor(
    roleService: RoleService,
    userRoleService: UserRoleService,
    userWorkspaceService: UserWorkspaceService,
    objectPermissionService: ObjectPermissionService,
    rowLevelPermissionPredicateService: RowLevelPermissionPredicateService,
    rowLevelPermissionPredicateGroupService: RowLevelPermissionPredicateGroupService,
    applicationService: ApplicationService,
    flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    this.deps = {
      roleService,
      userRoleService,
      userWorkspaceService,
      objectPermissionService,
      rowLevelPermissionPredicateService,
      rowLevelPermissionPredicateGroupService,
      applicationService,
      flatEntityMapsCacheService,
    };
  }

  generateRoleTools(context: RoleToolContext): ToolSet {
    const listRoles = createListRolesTool(this.deps, context);
    const createRole = createCreateRoleTool(this.deps, context);
    const updateRole = createUpdateRoleTool(this.deps, context);
    const deleteRole = createDeleteRoleTool(this.deps, context);
    const assignRoleToWorkspaceMember = createAssignRoleToWorkspaceMemberTool(
      this.deps,
      context,
    );
    const upsertObjectPermissions = createUpsertObjectPermissionsTool(
      this.deps,
      context,
    );
    const upsertRowLevelPermissionRules =
      createUpsertRowLevelPermissionRulesTool(this.deps, context);

    return {
      [listRoles.name]: listRoles,
      [createRole.name]: createRole,
      [updateRole.name]: updateRole,
      [deleteRole.name]: deleteRole,
      [assignRoleToWorkspaceMember.name]: assignRoleToWorkspaceMember,
      [upsertObjectPermissions.name]: upsertObjectPermissions,
      [upsertRowLevelPermissionRules.name]: upsertRowLevelPermissionRules,
    };
  }
}
