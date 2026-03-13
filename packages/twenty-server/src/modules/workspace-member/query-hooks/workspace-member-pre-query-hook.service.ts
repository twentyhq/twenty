import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class WorkspaceMemberPreQueryHookService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly onboardingService: OnboardingService,
    // oxlint-disable-next-line twenty/inject-workspace-repository
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async validateWorkspaceMemberUpdatePermissionOrThrow({
    userWorkspaceId,
    workspaceMemberId,
    targettedWorkspaceMemberId,
    workspaceId,
    apiKey,
  }: {
    userWorkspaceId?: string;
    workspaceMemberId?: string;
    targettedWorkspaceMemberId?: string;
    workspaceId: string;
    apiKey?: ApiKeyEntity | null;
  }) {
    if (isDefined(apiKey)) {
      return;
    }

    if (!userWorkspaceId) {
      throw new PermissionsException(
        PermissionsExceptionMessage.USER_WORKSPACE_NOT_FOUND,
        PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    if (
      isDefined(targettedWorkspaceMemberId) &&
      workspaceMemberId === targettedWorkspaceMemberId
    ) {
      return;
    }

    if (
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting: PermissionFlagType.WORKSPACE_MEMBERS,
        apiKeyId: apiKey ?? undefined,
      })
    ) {
      return;
    }

    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  async completeOnboardingProfileStepIfNameProvided({
    userId,
    workspaceId,
    firstName,
    lastName,
  }: {
    userId?: string;
    workspaceId: string;
    firstName?: string;
    lastName?: string;
  }) {
    if (!userId) {
      return;
    }

    if (firstName === '' && lastName === '') {
      return;
    }

    if (!isDefined(firstName) && !isDefined(lastName)) {
      return;
    }

    // Sync name back to core.user so "Created by" shows correctly

    const nameUpdate = {
      ...(isDefined(firstName) && firstName !== '' && { firstName }),
      ...(isDefined(lastName) && lastName !== '' && { lastName }),
    };

    if (Object.keys(nameUpdate).length > 0) {
      await this.userRepository.update({ id: userId }, nameUpdate);
    }

    await this.onboardingService.setOnboardingCreateProfilePending({
      userId,
      workspaceId,
      value: false,
    });
  }
}
