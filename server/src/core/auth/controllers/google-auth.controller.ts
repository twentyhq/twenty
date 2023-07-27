import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';
import FileType from 'file-type';
import { v4 as uuidV4 } from 'uuid';

import { FileFolder } from 'src/core/file/interfaces/file-folder.interface';

import { GoogleRequest } from 'src/core/auth/strategies/google.auth.strategy';
import { UserService } from 'src/core/user/user.service';
import { TokenService } from 'src/core/auth/services/token.service';
import { GoogleProviderEnabledGuard } from 'src/core/auth/guards/google-provider-enabled.guard';
import { GoogleOauthGuard } from 'src/core/auth/guards/google-oauth.guard';
import { WorkspaceService } from 'src/core/workspace/services/workspace.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { getImageBufferFromUrl } from 'src/utils/image';
import { FileUploadService } from 'src/core/file/services/file-upload.service';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService,
    private readonly environmentService: EnvironmentService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  @UseGuards(GoogleProviderEnabledGuard, GoogleOauthGuard)
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('redirect')
  @UseGuards(GoogleProviderEnabledGuard, GoogleOauthGuard)
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    const { firstName, lastName, email, picture, workspaceInviteHash } =
      req.user;

    let workspaceId: string | undefined = undefined;
    if (workspaceInviteHash) {
      const workspace = await this.workspaceService.findFirst({
        where: {
          inviteHash: workspaceInviteHash,
        },
      });

      if (!workspace) {
        return res.redirect(
          `${this.environmentService.getFrontAuthCallbackUrl()}`,
        );
      }

      workspaceId = workspace.id;
    }

    let imagePath: string | undefined = undefined;

    if (picture) {
      // Get image buffer from url
      const buffer = await getImageBufferFromUrl(picture);

      // Extract mimetype and extension from buffer
      const type = await FileType.fromBuffer(buffer);

      // Upload image
      const { paths } = await this.fileUploadService.uploadImage({
        file: buffer,
        filename: `${uuidV4()}.${type?.ext}`,
        mimeType: type?.mime,
        fileFolder: FileFolder.ProfilePicture,
      });

      imagePath = paths[0];
    }

    const user = await this.userService.createUser(
      {
        data: {
          email,
          firstName: firstName ?? '',
          lastName: lastName ?? '',
          locale: 'en',
          ...(imagePath ? { avatarUrl: imagePath } : {}),
          settings: {
            create: {
              locale: 'en',
            },
          },
        },
      },
      workspaceId,
    );

    const loginToken = await this.tokenService.generateLoginToken(user.email);

    return res.redirect(this.tokenService.computeRedirectURI(loginToken.token));
  }
}
