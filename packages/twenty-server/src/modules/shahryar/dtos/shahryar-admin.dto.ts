import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class ShahryarAdminPasswordResetRequestDTO {
  @IsUUID()
  workspaceMemberId: string;

  @IsString()
  @Length(8, 50)
  newPassword: string;
}

export class ShahryarAdminPasswordResetResponseDTO {
  success: boolean;
  workspaceMemberId: string;
  resetAt: string;
}

export class ShahryarAdminCreateSupervisorRequestDTO {
  @IsUUID()
  workspaceMemberId: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  username?: string;
}

export class ShahryarAdminUpdateUsernameRequestDTO {
  @IsUUID()
  workspaceMemberId: string;

  @IsString()
  @Length(1, 80)
  username: string;
}

export class ShahryarAdminRemoveSupervisorRequestDTO {
  @IsUUID()
  workspaceMemberId: string;
}

export class ShahryarAdminSupervisorOperationResponseDTO {
  success: boolean;
  workspaceMemberId: string;
  username: string;
  isShahryarSupervisor: boolean;
}

export type ShahryarAdminWorkspaceMemberDTO = {
  id: string;
  name: string;
  username: string;
  userEmail: string;
  isShahryarSupervisor: boolean;
};
