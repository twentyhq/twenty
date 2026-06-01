import { IsString, IsUUID, Length } from 'class-validator';

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

export type ShahryarAdminWorkspaceMemberDTO = {
  id: string;
  name: string;
  username: string;
  userEmail: string;
};
