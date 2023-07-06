import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '@prisma/client';
import { assert } from 'src/utils/assert';

export type UserPayload = {
  displayName: string | undefined | null;
  email: string;
};

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

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
    assert(args.data.email, 'email is missing', BadRequestException);

    const user = await this.prismaService.user.upsert({
      where: {
        email: args.data.email,
      },
      create: {
        ...(args.data as Prisma.UserCreateInput),
        // Assign the user to a new workspace by default
        workspaceMember: {
          create: {
            workspace: {
              create: {},
            },
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
