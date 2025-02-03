import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Resolver(() => RoleDTO)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @ResolveField('workspaceMembers', () => [WorkspaceMember])
  async getWorkspaceMembersAssignedToRole(
    @Parent() role: RoleDTO,
  ): Promise<WorkspaceMemberWorkspaceEntity[]> {
    return this.roleService.getWorkspaceMembersAssignedToRole(role);
  }
}
