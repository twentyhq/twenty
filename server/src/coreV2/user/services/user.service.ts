import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { assert } from 'src/utils/assert';
import { User } from 'src/coreV2/user/user.entity';
import { CreateUserInput } from 'src/coreV2/user/dtos/create-user.input';

export class UserService extends TypeOrmQueryService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  // Customs
  async createUser(args: CreateUserInput, _workspaceId?: string) {
    assert(args.email, 'email is missing', BadRequestException);

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();

    // // FIXME: Workspace entity does not exist
    // // Create workspace if not exists
    // const workspace = workspaceId
    //   ? await queryRunner.manager.findBy(Workspace, { id: workspaceId })
    //   : await this.workspaceService.createDefaultWorkspace();

    // assert(workspace, 'workspace is missing', BadRequestException);

    // // FIXME: UserSettings entity does not exist
    // const userSettings = queryRunner.manager.create(UserSettings, {
    //   locale: 'en',
    // });

    const user = await this.userRepository.upsert(
      {
        ...args,
        locale: 'en',
        // FIXME: settings and workspaceMember relations are not defined
        // settings: [{ id: userSettings.id }],
        // workspaceMember: [{ id: workspace.id }],
      },
      { skipUpdateIfNoValuesChanged: true, conflictPaths: ['email'] },
    );

    return user;
    // as Prisma.UserGetPayload<T>;
  }

  async deleteUser({
    workspaceId: _workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }) {
    // const { workspaceMember, refreshToken } = this.prismaService.client;

    // const queryRunner =
    //   this.userRepository.manager.connection.createQueryRunner();
    // await queryRunner.connect();

    const user = await this.findById(userId);
    assert(user, 'User not found');

    // FIXME: Workspace entity is not defined
    // const workspace = await queryRunner.manager.findOneBy(Workspace, {
    //   id: userId,
    // });
    // assert(workspace, 'Workspace not found');

    // const workSpaceMembers = await queryRunner.manager.findBy(WorkspaceMember, {
    //   workspaceId,
    // });

    // const isLastMember =
    //   workSpaceMembers.length === 1 && workSpaceMembers[0].userId === userId;

    // if (isLastMember) {
    //   // FIXME: workspaceService is not defined
    //   await this.workspaceService.deleteWorkspace({
    //     workspaceId,
    //   });
    // } else {
    //   await queryRunner.startTransaction();

    //   // FIXME: these other entities are not defined
    //   await queryRunner.manager.delete(WorkspaceMember, {
    //     userId,
    //   });
    //   await queryRunner.manager.delete(RefreshToken, {
    //     userId,
    //   });
    //   await queryRunner.manager.delete(User, {
    //     id: userId,
    //   });
    //   await queryRunner.commitTransaction();

    //   await queryRunner.release();
    // }

    return user;
  }
}
