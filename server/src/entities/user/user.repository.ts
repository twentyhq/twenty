import { Injectable } from '@nestjs/common';
import { User, Prisma, WorkspaceMember } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({ skip, take, cursor, where, orderBy });
  }

  async findUnique(params: {
    where?: Prisma.UserWhereInput;
  }): Promise<User | null> {
    const { where } = params;
    return this.prisma.user.findFirst({ where });
  }

  async upsertUser(params: {
    data: Prisma.UserCreateInput;
    workspaceId: string;
  }): Promise<User> {
    const { data } = params;

    return await this.prisma.user.upsert({
      where: {
        email: data.email,
      },
      create: {
        id: data.id,
        displayName: data.displayName,
        email: data.email,
        locale: data.locale,
      },
      update: {},
    });
  }

  async upsertWorkspaceMember(params: {
    data: Prisma.WorkspaceMemberUncheckedCreateInput;
  }): Promise<WorkspaceMember> {
    const { data } = params;

    return await this.prisma.workspaceMember.upsert({
      where: {
        userId: data.userId,
      },
      create: {
        id: data.id,
        userId: data.userId,
        workspaceId: data.workspaceId,
      },
      update: {},
    });
  }
}
