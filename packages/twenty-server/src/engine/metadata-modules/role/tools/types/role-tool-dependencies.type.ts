import type { ApplicationService } from 'src/engine/core-modules/application/application.service';
import type { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import type { RoleService } from 'src/engine/metadata-modules/role/role.service';
import type { RowLevelPermissionPredicateGroupService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate-group.service';
import type { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import type { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

export type RoleToolDependencies = {
  roleService: RoleService;
  userRoleService: UserRoleService;
  objectPermissionService: ObjectPermissionService;
  rowLevelPermissionPredicateService: RowLevelPermissionPredicateService;
  rowLevelPermissionPredicateGroupService: RowLevelPermissionPredicateGroupService;
  applicationService: ApplicationService;
};
