import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  type ShahryarAdminPasswordResetResponseDTO,
  type ShahryarAdminWorkspaceMemberDTO,
} from 'src/modules/shahryar/dtos/shahryar-admin.dto';
import { type DataSource } from 'typeorm';

type ShahryarAdminWorkspaceMemberRow = {
  id: string;
  nameFirstName?: string | null;
  nameLastName?: string | null;
  username?: string | null;
  userEmail?: string | null;
};

const quotePostgresIdentifier = (identifier: string): string =>
  `"${identifier.replace(/"/g, '""')}"`;

const toWorkspaceTableName = ({
  tableName,
  workspaceId,
}: {
  tableName: string;
  workspaceId: string;
}): string =>
  `${quotePostgresIdentifier(
    getWorkspaceSchemaName(workspaceId),
  )}.${quotePostgresIdentifier(tableName)}`;

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

@Injectable()
export class ShahryarAdminWorkspaceService {
  constructor(
    private readonly authService: AuthService,
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
    await this.assertCanResetPasswords({
      workspaceId,
      adminUserWorkspaceId,
    });

    const rows = (await this.coreDataSource.query(
      `SELECT "id", "nameFirstName", "nameLastName", "username", "userEmail"
       FROM ${toWorkspaceTableName({ tableName: 'workspaceMember', workspaceId })}
       ORDER BY "nameFirstName" ASC, "nameLastName" ASC, "username" ASC`,
    )) as ShahryarAdminWorkspaceMemberRow[];

    return rows.map((row) => ({
      id: row.id,
      name: toWorkspaceMemberName(row),
      username: row.username ?? '',
      userEmail: row.userEmail ?? '',
    }));
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
    await this.assertCanResetPasswords({
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

  private async assertCanResetPasswords({
    workspaceId,
    adminUserWorkspaceId,
  }: {
    workspaceId: string;
    adminUserWorkspaceId: string | undefined;
  }): Promise<void> {
    if (adminUserWorkspaceId === undefined) {
      throw new ForbiddenException(
        'Only Shahryar admins can reset user passwords.',
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
        'Only Shahryar admins can reset user passwords.',
      );
    }
  }
}
