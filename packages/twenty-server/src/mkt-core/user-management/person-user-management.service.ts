import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { APP_LOCALES } from 'twenty-shared/translations';
import { Repository } from 'typeorm';

import { hashPassword } from 'src/engine/core-modules/auth/auth.util';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CreateUserInput } from 'src/mkt-core/user-management/dto/create-user.input';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import { UserOutput } from './dto/user.output';

@Injectable()
export class PersonUserManagementService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

  async createPersonUser(
    workspaceId: string,
    createUserInput: CreateUserInput,
  ): Promise<UserOutput> {
    // B1: check xem có tài khoản trong core chưa ?
    let coreUser = await this.userRepository.findOne({
      where: { email: createUserInput.email },
    });

    if (!coreUser) {
      // B2: Tạo mới user trong core nếu không tồn tại
      coreUser = this.userRepository.create({
        email: createUserInput.email,
        firstName: createUserInput.firstName || '',
        passwordHash: await hashPassword(createUserInput.password || ''),
        lastName: createUserInput.lastName || '',
        isEmailVerified: createUserInput.isEmailVerified,
        canImpersonate: createUserInput.canImpersonate,
        canAccessFullAdminPanel: createUserInput.canAdmin || false,
        locale: createUserInput.language || 'en',
        defaultAvatarUrl: createUserInput.avatarUrl || undefined,
      });
      coreUser = await this.userRepository.save(coreUser);
    }

    // Step 3: Kiểm tra xem có trong userWorkpace chưa
    let userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId: coreUser.id,
        workspaceId: workspaceId,
      },
    });

    if (!userWorkspace) {
      // Step 4: Nếu có rồi thì không tạo mới bảng quan hệ
      userWorkspace = this.userWorkspaceRepository.create({
        userId: coreUser.id,
        workspaceId: workspaceId,
        locale: (createUserInput.language || 'en') as keyof typeof APP_LOCALES,
        defaultAvatarUrl: createUserInput.avatarUrl || undefined,
      });
      userWorkspace = await this.userWorkspaceRepository.save(userWorkspace);
    }

    // Step 5: Tạo mới dữ liệu trong person
    // const personRepository =
    //   await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
    //     workspaceId,
    //     PersonWorkspaceEntity,
    //     { shouldBypassPermissionChecks: true },
    //   );

    // const dataPerson = {
    //   name: {
    //     firstName: createUserInput.firstName || '',
    //     lastName: createUserInput.lastName || '',
    //   },
    //   emails: {
    //     primaryEmail: createUserInput.email,
    //     additionalEmails: [],
    //   },
    //   phones: {
    //     primaryPhoneNumber: createUserInput.phone || '',
    //     primaryPhoneCountryCode: 'VN' as any,
    //     primaryPhoneCallingCode: '+84',
    //     additionalPhones: [],
    //   },
    //   jobTitle: createUserInput.jobTitle || '',
    //   city: createUserInput.city || '',
    //   avatarUrl: createUserInput.avatarUrl || '',
    // };
    // const savedPerson = await personRepository.save(dataPerson);
    // B6: Tạo mới dữ liệu trong workpaceMember
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );
    const savedWorkspaceMember = await workspaceMemberRepository.save({
      name: {
        firstName: createUserInput.firstName || '',
        lastName: createUserInput.lastName || '',
      },
      position:
        createUserInput.position != null ? Number(createUserInput.position) : 0,
      colorScheme: createUserInput.colorScheme ?? 'System',
      locale: (createUserInput.language || 'en') as keyof typeof APP_LOCALES,
      avatarUrl: createUserInput.avatarUrl ?? '', // not null
      userId: coreUser.id,
      userEmail: createUserInput.email.toLowerCase(),
      calendarStartDay: createUserInput.calendarStartDay ?? 7, // not null
      timeZone: createUserInput.timeZone ?? 'system', // not null
      dateFormat: createUserInput.dateFormat ?? 'SYSTEM', // not null
      timeFormat: createUserInput.timeFormat ?? 'SYSTEM', // not null
      departmentId: createUserInput.departmentId ?? null,
      employmentStatusId: createUserInput.employmentStatusId ?? null,
      organizationLevelId: createUserInput.organizationLevelId ?? null,
    });

    return {
      email: createUserInput.email,
      firstName: savedWorkspaceMember.name?.firstName || '',
      lastName: savedWorkspaceMember.name?.lastName || '',
      canImpersonate: createUserInput.canImpersonate,
      isEmailVerified: createUserInput.isEmailVerified,
      jobTitle: createUserInput.jobTitle || '',
      city: createUserInput.city || '',
      phone: createUserInput.phone || '',
      canAdmin: createUserInput.canAdmin || false,
      language: savedWorkspaceMember.locale || createUserInput.language || 'en',
      avatarUrl:
        savedWorkspaceMember.avatarUrl ||
        createUserInput.avatarUrl ||
        undefined,
    };
  }

  async listPersonUsers(workspaceId: string): Promise<UserOutput[]> {
    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
        workspaceId,
        PersonWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const persons = await personRepository.find({
      relations: ['name', 'emails', 'phones'],
    });

    return persons.map((person) => ({
      id: person.id,
      firstName: person.name?.firstName || '',
      lastName: person.name?.lastName || '',
      email: person.emails?.primaryEmail || '',
      jobTitle: person.jobTitle,
      city: person.city,
      phone: person.phones?.primaryPhoneNumber || '',
      avatarUrl: person.avatarUrl,
      isEmailVerified: false, // This would need to be fetched from core user
      canImpersonate: false, // This would need to be fetched from core user
      canAdmin: false, // This would need to be fetched from core user
      language: 'en', // This would need to be fetched from core user
    }));
  }
}
