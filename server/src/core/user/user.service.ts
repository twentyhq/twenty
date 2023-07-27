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

    // Create user
    const user = await this.prismaService.client.user.upsert({
      where: {
        email: args.data.email,
      },
      create: {
        ...(args.data as Prisma.UserCreateInput),

        workspaceMember: {
          create: {
            workspace: {
              connect: { id: workspace.id },
            },
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
}
