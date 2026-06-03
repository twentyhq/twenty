import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { SHAHRYAR_SUPERVISOR_ROLE_SEED } from 'src/engine/workspace-manager/dev-seeder/core/constants/shahryar-role-seeds.constant';
import {
  type ShahryarAdminPasswordResetResponseDTO,
  type ShahryarAdminSupervisorOperationResponseDTO,
  type ShahryarAdminWorkspaceMemberDTO,
} from 'src/modules/shahryar/dtos/shahryar-admin.dto';
import { toWorkspaceTableName } from 'src/modules/shahryar/utils/to-workspace-table-name.util';
import { type DataSource } from 'typeorm';

type ShahryarAdminWorkspaceMemberRow = {
  id: string;
  nameFirstName?: string | null;
  nameLastName?: string | null;
  username?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  userWorkspaceId?: string | null;
};

type WorkspaceDefaultRoleRow = {
  defaultRoleId?: string | null;
};

const toWorkspaceMemberName = (
  workspaceMember: ShahryarAdminWorkspaceMemberRow,
): string => {
  const fullName = [workspaceMember.nameFirstName, workspaceMember.nameLastName]
    .filter(
      (namePart): namePart is string =>
        namePart !== undefined &&
        namePart !== null &&
        namePart.trim().length > 0,
    )
    .join(' ')
    .trim();

  return fullName || workspaceMember.username || workspaceMember.id;
};

const isShahryarSupervisorRole = (role: RoleEntity): boolean =>
  role.label === SHAHRYAR_SUPERVISOR_ROLE_SEED.label;

@Injectable()
export class ShahryarAdminWorkspaceService {
  constructor(
    private readonly authService: AuthService,
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    private readonly userWorkspaceService: UserWorkspaceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async listWorkspaceMembers({
    workspaceId,
    adminUserWorkspaceId,
  }: {
    workspaceId: string;
    adminUserWorkspaceId: string | undefined;
  }): Promise<ShahryarAdminWorkspaceMemberDTO[]> {
    await this.assertCanManageSupervisors({
      workspaceId,
      adminUserWorkspaceId,
    });

    const rows = (await this.coreDataSource.query(
      `SELECT
         "workspaceMember"."id",
         "workspaceMember"."nameFirstName",
         "workspaceMember"."nameLastName",
         "workspaceMember"."username",
         "workspaceMember"."userId",
         "workspaceMember"."userEmail",
         "userWorkspace"."id" AS "userWorkspaceId"
       FROM ${toWorkspaceTableName({ tableName: 'workspaceMember', workspaceId })} "workspaceMember"
       LEFT JOIN core."userWorkspace" "userWorkspace"
         ON "userWorkspace"."userId" = "workspaceMember"."userId"
        AND "userWorkspace"."workspaceId" = $1
        AND "userWorkspace"."deletedAt" IS NULL
       ORDER BY "workspaceMember"."nameFirstName" ASC,
         "workspaceMember"."nameLastName" ASC,
         "workspaceMember"."username" ASC`,
      [workspaceId],
    )) as ShahryarAdminWorkspaceMemberRow[];

    const userWorkspaceIds = rows
      .map((row) => row.userWorkspaceId)
      .filter(isNonEmptyString);
    const rolesByUserWorkspace =
      await this.userRoleService.getRolesByUserWorkspaces({
        workspaceId,
        userWorkspaceIds,
      });

    return rows.map((row) => ({
      id: row.id,
      name: toWorkspaceMemberName(row),
      username: row.username ?? '',
      userEmail: row.userEmail ?? '',
      isShahryarSupervisor:
        isNonEmptyString(row.userWorkspaceId) &&
        (rolesByUserWorkspace.get(row.userWorkspaceId) ?? []).some(
          isShahryarSupervisorRole,
        ),
    }));
  }

  async createSupervisor({
    workspaceId,
    adminUserWorkspaceId,
    workspaceMemberId,
    username,
  }: {
    workspaceId: string;
    adminUserWorkspaceId: string | undefined;
    workspaceMemberId: string;
    username?: string;
  }): Promise<ShahryarAdminSupervisorOperationResponseDTO> {
    await this.assertCanManageSupervisors({
      workspaceId,
      adminUserWorkspaceId,
    });

    const { userWorkspaceId } = await this.resolveUserWorkspaceForMember({
      workspaceId,
      workspaceMemberId,
    });
    const supervisorRole = await this.getSupervisorRoleOrThrow(workspaceId);
    const normalizedUsername = isDefined(username)
      ? await this.updateWorkspaceMemberUsername({
          workspaceId,
          workspaceMemberId,
          username,
        })
      : await this.getWorkspaceMemberUsername({
          workspaceId,
          workspaceMemberId,
        });

    await this.userRoleService.assignRoleToManyUserWorkspace({
      workspaceId,
      userWorkspaceIds: [userWorkspaceId],
      roleId: supervisorRole.id,
    });

    return {
      success: true,
      workspaceMemberId,
      username: normalizedUsername,
      isShahryarSupervisor: true,
    };
  }

  async updateSupervisorUsername({
    workspaceId,
    adminUserWorkspaceId,
    workspaceMemberId,
    username,
  }: {
    workspaceId: string;
    adminUserWorkspaceId: string | undefined;
    workspaceMemberId: string;
    username: string;
  }): Promise<ShahryarAdminSupervisorOperationResponseDTO> {
    await this.assertCanManageSupervisors({
      workspaceId,
      adminUserWorkspaceId,
    });

    await this.resolveUserWorkspaceForMember({
      workspaceId,
      workspaceMemberId,
    });

    const normalizedUsername = await this.updateWorkspaceMemberUsername({
      workspaceId,
      workspaceMemberId,
      username,
    });

    return {
      success: true,
      workspaceMemberId,
      username: normalizedUsername,
      isShahryarSupervisor: await this.isWorkspaceMemberSupervisor({
        workspaceId,
        workspaceMemberId,
      }),
    };
  }

  async removeSupervisor({
    workspaceId,
    adminUserWorkspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    adminUserWorkspaceId: string | undefined;
    workspaceMemberId: string;
  }): Promise<ShahryarAdminSupervisorOperationResponseDTO> {
    await this.assertCanManageSupervisors({
      workspaceId,
      adminUserWorkspaceId,
    });

    const { userWorkspaceId } = await this.resolveUserWorkspaceForMember({
      workspaceId,
      workspaceMemberId,
    });
    const supervisorRole = await this.getSupervisorRoleOrThrow(workspaceId);
    const currentRoles = await this.userRoleService.getRolesByUserWorkspaces({
      workspaceId,
      userWorkspaceIds: [userWorkspaceId],
    });
    const hasSupervisorRole =
      currentRoles
        .get(userWorkspaceId)
        ?.some((role) => role.id === supervisorRole.id) ?? false;

    if (hasSupervisorRole) {
      const defaultRoleId =
        await this.getWorkspaceDefaultRoleIdOrThrow(workspaceId);

      await this.userRoleService.assignRoleToManyUserWorkspace({
        workspaceId,
        userWorkspaceIds: [userWorkspaceId],
        roleId: defaultRoleId,
      });
    }

    return {
      success: true,
      workspaceMemberId,
      username: await this.getWorkspaceMemberUsername({
        workspaceId,
        workspaceMemberId,
      }),
      isShahryarSupervisor: false,
    };
  }

  async resetWorkspaceMemberPassword({
    workspaceId,
    adminUserWorkspaceId,
    workspaceMemberId,
    newPassword,
    resetAt = new Date(),
  }: {
    workspaceId: string;
    adminUserWorkspaceId: string | undefined;
    workspaceMemberId: string;
    newPassword: string;
    resetAt?: Date;
  }): Promise<ShahryarAdminPasswordResetResponseDTO> {
    await this.assertCanManageSupervisors({
      workspaceId,
      adminUserWorkspaceId,
    });

    const workspaceMember =
      await this.userWorkspaceService.getWorkspaceMemberOrThrow({
        workspaceId,
        workspaceMemberId,
      });

    await this.authService.updatePassword(workspaceMember.userId, newPassword);

    return {
      success: true,
      workspaceMemberId,
      resetAt: resetAt.toISOString(),
    };
  }

  private async assertCanManageSupervisors({
    workspaceId,
    adminUserWorkspaceId,
  }: {
    workspaceId: string;
    adminUserWorkspaceId: string | undefined;
  }): Promise<void> {
    if (adminUserWorkspaceId === undefined) {
      throw new ForbiddenException(
        'Only Shahryar admins can manage supervisors.',
      );
    }

    const roleMap = await this.userRoleService.getRolesByUserWorkspaces({
      workspaceId,
      userWorkspaceIds: [adminUserWorkspaceId],
    });
    const roles = roleMap.get(adminUserWorkspaceId) ?? [];
    const canResetPasswords = roles.some((role) => role.canUpdateAllSettings);

    if (!canResetPasswords) {
      throw new ForbiddenException(
        'Only Shahryar admins can manage supervisors.',
      );
    }
  }

  private async resolveUserWorkspaceForMember({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<{ userWorkspaceId: string }> {
    const workspaceMember =
      await this.userWorkspaceService.getWorkspaceMemberOrThrow({
        workspaceId,
        workspaceMemberId,
      });
    const userWorkspace =
      await this.userWorkspaceService.checkUserWorkspaceExists(
        workspaceMember.userId,
        workspaceId,
      );

    if (!isDefined(userWorkspace)) {
      throw new NotFoundException(
        'Workspace user for Shahryar supervisor was not found.',
      );
    }

    return { userWorkspaceId: userWorkspace.id };
  }

  private async getSupervisorRoleOrThrow(
    workspaceId: string,
  ): Promise<RoleEntity> {
    const roles = await this.roleService.getWorkspaceRoles(workspaceId);
    const supervisorRole = roles.find(isShahryarSupervisorRole);

    if (!isDefined(supervisorRole)) {
      throw new NotFoundException('Shahryar supervisor role was not found.');
    }

    return supervisorRole;
  }

  private async getWorkspaceDefaultRoleIdOrThrow(
    workspaceId: string,
  ): Promise<string> {
    const rows = (await this.coreDataSource.query(
      `SELECT "defaultRoleId"
       FROM core."workspace"
       WHERE "id" = $1`,
      [workspaceId],
    )) as WorkspaceDefaultRoleRow[];
    const defaultRoleId = rows[0]?.defaultRoleId;

    if (!isNonEmptyString(defaultRoleId)) {
      throw new NotFoundException('Workspace default role was not found.');
    }

    return defaultRoleId;
  }

  private async updateWorkspaceMemberUsername({
    workspaceId,
    workspaceMemberId,
    username,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    username: string;
  }): Promise<string> {
    const normalizedUsername = username.trim();

    if (normalizedUsername.length === 0) {
      throw new ConflictException('Username cannot be empty.');
    }

    const duplicateRows = (await this.coreDataSource.query(
      `SELECT "id"
       FROM ${toWorkspaceTableName({ tableName: 'workspaceMember', workspaceId })}
       WHERE LOWER("username") = LOWER($1)
         AND "id" <> $2
       LIMIT 1`,
      [normalizedUsername, workspaceMemberId],
    )) as Array<{ id: string }>;

    if (duplicateRows.length > 0) {
      throw new ConflictException('This Shahryar username is already used.');
    }

    await this.coreDataSource.query(
      `UPDATE ${toWorkspaceTableName({ tableName: 'workspaceMember', workspaceId })}
       SET "username" = $1,
           "updatedAt" = NOW()
       WHERE "id" = $2`,
      [normalizedUsername, workspaceMemberId],
    );

    return normalizedUsername;
  }

  private async getWorkspaceMemberUsername({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<string> {
    const rows = (await this.coreDataSource.query(
      `SELECT "username"
       FROM ${toWorkspaceTableName({ tableName: 'workspaceMember', workspaceId })}
       WHERE "id" = $1`,
      [workspaceMemberId],
    )) as Array<{ username?: string | null }>;

    return rows[0]?.username ?? '';
  }

  private async isWorkspaceMemberSupervisor({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<boolean> {
    const { userWorkspaceId } = await this.resolveUserWorkspaceForMember({
      workspaceId,
      workspaceMemberId,
    });
    const rolesByUserWorkspace =
      await this.userRoleService.getRolesByUserWorkspaces({
        workspaceId,
        userWorkspaceIds: [userWorkspaceId],
      });

    return (
      rolesByUserWorkspace
        .get(userWorkspaceId)
        ?.some(isShahryarSupervisorRole) ?? false
    );
  }
}
