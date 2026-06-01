import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  StreamableFile,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  ShahryarAdminPasswordResetRequestDTO,
  type ShahryarAdminPasswordResetResponseDTO,
  type ShahryarAdminWorkspaceMemberDTO,
} from 'src/modules/shahryar/dtos/shahryar-admin.dto';
import {
  ShahryarCreateRecordRequestDTO,
  type ShahryarCreateRecordResponseDTO,
  type ShahryarRecordSectionDTO,
} from 'src/modules/shahryar/dtos/shahryar-record-section.dto';
import {
  type ShahryarNotificationDeliveryDTO,
  type ShahryarNotificationDispatchResultDTO,
} from 'src/modules/shahryar/dtos/shahryar-notification.dto';
import {
  ShahryarMobileNotificationRegistrationRequestDTO,
  type ShahryarMobileNotificationRegistrationResponseDTO,
  ShahryarMobilePhotoAssociationRequestDTO,
  type ShahryarMobilePhotoAssociationResponseDTO,
  type ShahryarMobileSyncPullResponseDTO,
  ShahryarMobileSyncRequestDTO,
  type ShahryarMobileSyncResponseDTO,
} from 'src/modules/shahryar/dtos/shahryar-mobile-sync.dto';
import { type ShahryarBackupStatusDTO } from 'src/modules/shahryar/dtos/shahryar-backup.dto';
import { type ShahryarReportSummaryDTO } from 'src/modules/shahryar/dtos/shahryar-report.dto';
import { ShahryarAdminWorkspaceService } from 'src/modules/shahryar/services/shahryar-admin.workspace-service';
import { ShahryarBackupService } from 'src/modules/shahryar/services/shahryar-backup.service';
import { ShahryarMobileSyncService } from 'src/modules/shahryar/services/shahryar-mobile-sync.service';
import { ShahryarNotificationService } from 'src/modules/shahryar/services/shahryar-notification.service';
import { ShahryarReportService } from 'src/modules/shahryar/services/shahryar-report.service';

@Controller('rest/shahryar')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ShahryarController {
  constructor(
    private readonly shahryarAdminWorkspaceService: ShahryarAdminWorkspaceService,
    private readonly shahryarBackupService: ShahryarBackupService,
    private readonly shahryarReportService: ShahryarReportService,
    private readonly shahryarMobileSyncService: ShahryarMobileSyncService,
    private readonly shahryarNotificationService: ShahryarNotificationService,
    private readonly userRoleService: UserRoleService,
  ) {}

  @Get('backups/status')
  async getBackupStatus(): Promise<ShahryarBackupStatusDTO> {
    return await this.shahryarBackupService.getStatus();
  }

  @Get('admin/workspace-members')
  async listAdminWorkspaceMembers(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<ShahryarAdminWorkspaceMemberDTO[]> {
    return await this.shahryarAdminWorkspaceService.listWorkspaceMembers({
      workspaceId: workspace.id,
      adminUserWorkspaceId: userWorkspaceId,
    });
  }

  @Get('reports/summary')
  async getReportSummary(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<ShahryarReportSummaryDTO> {
    const assignedSupervisorId = await this.resolveAssignedSupervisorId({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
    });

    return await this.shahryarReportService.getSummary(workspace.id, {
      authorizedSupervisorId: assignedSupervisorId,
    });
  }

  @Get('records/sections')
  async getRecordSections(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<ShahryarRecordSectionDTO[]> {
    const assignedSupervisorId = await this.resolveAssignedSupervisorId({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
    });

    return await this.shahryarReportService.getRecordSections(workspace.id, {
      authorizedSupervisorId: assignedSupervisorId,
    });
  }

  @Post('records')
  async createRecord(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
    @Body() request: ShahryarCreateRecordRequestDTO,
  ): Promise<ShahryarCreateRecordResponseDTO> {
    const assignedSupervisorId = await this.resolveAssignedSupervisorId({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
    });

    return await this.shahryarReportService.createRecord({
      authorizedSupervisorId: assignedSupervisorId,
      request,
      workspaceId: workspace.id,
    });
  }

  @Get('notifications/pending')
  async getPendingNotifications(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<ShahryarNotificationDeliveryDTO[]> {
    const assignedSupervisorId = await this.resolveAssignedSupervisorId({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
    });

    return await this.shahryarNotificationService.getPendingDeliveries({
      authorizedSupervisorId: assignedSupervisorId,
      workspaceId: workspace.id,
    });
  }

  @Post('notifications/dispatch')
  async dispatchPendingNotifications(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<ShahryarNotificationDispatchResultDTO> {
    const assignedSupervisorId = await this.resolveAssignedSupervisorId({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
    });

    return await this.shahryarNotificationService.dispatchPendingNotifications({
      authorizedSupervisorId: assignedSupervisorId,
      workspaceId: workspace.id,
    });
  }

  @Post('admin/password-reset')
  async resetWorkspaceMemberPassword(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Body() request: ShahryarAdminPasswordResetRequestDTO,
  ): Promise<ShahryarAdminPasswordResetResponseDTO> {
    return this.shahryarAdminWorkspaceService.resetWorkspaceMemberPassword({
      workspaceId: workspace.id,
      adminUserWorkspaceId: userWorkspaceId,
      workspaceMemberId: request.workspaceMemberId,
      newPassword: request.newPassword,
    });
  }

  @Get('reports/export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="shahryar-report.csv"')
  async getReportCsvExport(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<string> {
    const assignedSupervisorId = await this.resolveAssignedSupervisorId({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
    });

    return await this.shahryarReportService.getCsvExport(workspace.id, {
      authorizedSupervisorId: assignedSupervisorId,
    });
  }

  @Get('reports/export.excel.xls')
  @Header('Content-Type', 'application/vnd.ms-excel; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="shahryar-report.xls"')
  async getReportExcelExport(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<string> {
    const assignedSupervisorId = await this.resolveAssignedSupervisorId({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
    });

    return await this.shahryarReportService.getExcelExport(workspace.id, {
      authorizedSupervisorId: assignedSupervisorId,
    });
  }

  @Get('reports/export.pdf')
  async getReportPdfExport(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<StreamableFile> {
    const assignedSupervisorId = await this.resolveAssignedSupervisorId({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
    });
    const pdf = await this.shahryarReportService.getPdfExport(workspace.id, {
      authorizedSupervisorId: assignedSupervisorId,
    });

    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: 'attachment; filename="shahryar-report.pdf"',
      length: pdf.length,
    });
  }

  @Post('mobile/sync')
  async syncMobileChanges(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
    @Body() request: ShahryarMobileSyncRequestDTO,
  ): Promise<ShahryarMobileSyncResponseDTO> {
    const assignedSupervisorId = await this.resolveAssignedSupervisorId({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
    });

    return await this.shahryarMobileSyncService.resolveSyncRequest({
      authorizedSupervisorId: assignedSupervisorId,
      request,
      workspaceId: workspace.id,
    });
  }

  @Get('mobile/sync/pull')
  async pullMobileSyncData(
    @AuthWorkspace() workspace: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<ShahryarMobileSyncPullResponseDTO> {
    const assignedSupervisorId = await this.resolveAssignedSupervisorId({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
    });

    return await this.shahryarMobileSyncService.getPullResponse({
      assignedSupervisorId,
      workspaceId: workspace.id,
    });
  }

  @Post('mobile/photo-associations')
  async associateMobilePhoto(
    @AuthWorkspace() workspace: { id: string },
    @Body() request: ShahryarMobilePhotoAssociationRequestDTO,
  ): Promise<ShahryarMobilePhotoAssociationResponseDTO> {
    return await this.shahryarMobileSyncService.associatePhoto({
      request,
      workspaceId: workspace.id,
    });
  }

  @Post('mobile/notifications/register')
  async registerMobileNotifications(
    @AuthWorkspace() workspace: { id: string },
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
    @Body() request: ShahryarMobileNotificationRegistrationRequestDTO,
  ): Promise<ShahryarMobileNotificationRegistrationResponseDTO> {
    return await this.shahryarMobileSyncService.registerNotifications({
      request,
      workspaceId: workspace.id,
      workspaceMemberId,
    });
  }

  private async resolveAssignedSupervisorId({
    workspaceId,
    userWorkspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    workspaceMemberId: string | undefined;
  }): Promise<string | undefined> {
    if (userWorkspaceId === undefined || workspaceMemberId === undefined) {
      return undefined;
    }

    const roleMap = await this.userRoleService.getRolesByUserWorkspaces({
      workspaceId,
      userWorkspaceIds: [userWorkspaceId],
    });
    const roles = roleMap.get(userWorkspaceId) ?? [];
    const canSeeAllShahryarData = roles.some(
      (role) => role.canReadAllObjectRecords || role.canUpdateAllSettings,
    );

    return canSeeAllShahryarData ? undefined : workspaceMemberId;
  }
}
