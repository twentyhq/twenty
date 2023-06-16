import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { WorkspaceService } from 'src/core/workspace/services/workspace.service';
import { Prisma, User } from '@prisma/client';
import { assert } from 'src/utils/assert';

export type UserPayload = {
  displayName: string | undefined | null;
  email: string;
};

type SelectOrIncludePayload<T, U> = T extends Prisma.UserSelect
  ? Prisma.UserGetPayload<{ select: T }>
  : U extends Prisma.UserInclude
  ? Prisma.UserGetPayload<{ include: U }>
  : User;

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  // Find
  findFirst = this.prismaService.user.findFirst;
  findFirstOrThrow = this.prismaService.user.findFirstOrThrow;

  findUnique = this.prismaService.user.findUnique;
  findUniqueOrThrow = this.prismaService.user.findUniqueOrThrow;

  findMany = this.prismaService.user.findMany;

  // Create
  create = this.prismaService.user.create;
  createMany = this.prismaService.user.createMany;

  // Update
  update = this.prismaService.user.update;
  upsert = this.prismaService.user.upsert;
  updateMany = this.prismaService.user.updateMany;

  // Delete
  delete = this.prismaService.user.delete;
  deleteMany = this.prismaService.user.deleteMany;

  // Aggregate
  aggregate = this.prismaService.user.aggregate;

  // Count
  count = this.prismaService.user.count;

  // GroupBy
  groupBy = this.prismaService.user.groupBy;

  // Customs
  async createUser<T extends Prisma.UserCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserCreateArgs>,
  ): Promise<Prisma.UserGetPayload<T>> {
    assert(args.data.email, 'Email is missing', BadRequestException);
    assert(
      args.data.displayName,
      'DisplayName is missing',
      BadRequestException,
    );

    const emailDomain = args.data.email.split('@')[1];

    assert(emailDomain, 'Email is malformed', BadRequestException);

    const workspace = await this.workspaceService.findUnique({
      where: { domainName: emailDomain },
    });

    assert(
      workspace,
      'User email domain does not match an existing workspace',
      ForbiddenException,
    );

    const user = await this.prismaService.user.upsert({
      where: {
        email: args.data.email,
      },
      create: {
        ...(args.data as Prisma.UserCreateInput),
        workspaceMember: {
          connectOrCreate: {
            where: { id: workspace.id },
            create: { workspaceId: workspace.id },
          },
        },
        locale: 'en',
      },
      update: {},
      ...(args.select ? { select: args.select } : {}),
      ...(args.include ? { include: args.include } : {}),
    });

    return user as Prisma.UserGetPayload<T>;
  }
}
