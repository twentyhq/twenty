import { BadRequestException, Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/database/prisma.service';
import { assert } from 'src/utils/assert';
import { WorkspaceService } from 'src/core/workspace/services/workspace.service';

export type UserPayload = {
  displayName: string | undefined | null;
  email: string;
};

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  // Find
  findFirst = this.prismaService.client.user.findFirst;
  findFirstOrThrow = this.prismaService.client.user.findFirstOrThrow;

  findUnique = this.prismaService.client.user.findUnique;
  findUniqueOrThrow = this.prismaService.client.user.findUniqueOrThrow;

  findMany = this.prismaService.client.user.findMany;

  // Create
  create = this.prismaService.client.user.create;
  createMany = this.prismaService.client.user.createMany;

  // Update
  update = this.prismaService.client.user.update;
  upsert = this.prismaService.client.user.upsert;
  updateMany = this.prismaService.client.user.updateMany;

  // Delete
  delete = this.prismaService.client.user.delete;
  deleteMany = this.prismaService.client.user.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.user.aggregate;

  // Count
  count = this.prismaService.client.user.count;

  // GroupBy
  groupBy = this.prismaService.client.user.groupBy;

  // Customs
  async createUser<T extends Prisma.UserCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserCreateArgs>,
    workspaceId?: string,
  ): Promise<Prisma.UserGetPayload<T>> {
    assert(args.data.email, 'email is missing', BadRequestException);

    // Create workspace if not exists
    const workspace = workspaceId
      ? await this.workspaceService.findUnique({
          where: {
            id: workspaceId,
          },
        })
      : await this.workspaceService.createDefaultWorkspace();

    assert(workspace, 'workspace is missing', BadRequestException);

    const userSettings = await this.prismaService.client.userSettings.create({
      data: { locale: 'en' },
    });

    const settings = { connect: { id: userSettings.id } };

    // Create user
    const user = await this.prismaService.client.user.upsert({
      where: {
        email: args.data.email,
      },
      create: {
        ...(args.data as Prisma.UserCreateInput),
        settings,

        workspaceMember: {
          create: {
            workspace: {
              connect: { id: workspace.id },
            },
            settings,
          },
        },
        locale: 'en',
      },
      update: {},
      ...(args.select ? { select: args.select } : {}),
      ...(args.include ? { include: args.include } : {}),
    } as Prisma.UserUpsertArgs);

    return user as Prisma.UserGetPayload<T>;
  }

  async deleteUser({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }) {
    const { workspaceMember, refreshToken } = this.prismaService.client;
    const user = await this.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });
    assert(user, 'User not found');

    const workspace = await this.workspaceService.findUnique({
      where: { id: workspaceId },
      select: { id: true },
    });
    assert(workspace, 'Workspace not found');

    const workSpaceMembers = await workspaceMember.findMany({
      where: {
        workspaceId,
      },
    });

    const isLastMember =
      workSpaceMembers.length === 1 && workSpaceMembers[0].userId === userId;

    if (isLastMember) {
      // Delete entire workspace
      await this.workspaceService.deleteWorkspace({
        workspaceId,
        userId,
        select: { id: true },
      });
    } else {
      await this.prismaService.client.$transaction([
        workspaceMember.deleteMany({
          where: { userId },
        }),

        refreshToken.deleteMany({
          where: { userId },
        }),

        this.delete({ where: { id: userId } }),
      ]);
    }

    return user;
  }
}
