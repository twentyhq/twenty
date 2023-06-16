import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { PrismaService } from 'src/database/prisma.service';
import { WorkspaceService } from 'src/core/workspace/services/workspace.service';
import { WorkspaceMemberService } from 'src/core/workspace/services/workspace-member.service';

export type UserPayload = {
  firstName: string;
  lastName: string;
  email: string;
};

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceMemberService: WorkspaceMemberService,
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
  async createUser(rawUser: UserPayload) {
    if (!rawUser.email) {
      throw new BadRequestException('Email is missing');
    }

    if (!rawUser.firstName || !rawUser.lastName) {
      throw new BadRequestException('Firstname or lastname is missing');
    }

    const emailDomain = rawUser.email.split('@')[1];

    if (!emailDomain) {
      throw new BadRequestException('Email is malformed');
    }

    const workspace = await this.workspaceService.findUnique({
      where: { domainName: emailDomain },
    });

    if (!workspace) {
      throw new ForbiddenException(
        'User email domain does not match an existing workspace',
      );
    }

    const user = await this.prismaService.user.upsert({
      where: {
        email: rawUser.email,
      },
      create: {
        id: v4(),
        displayName: rawUser.firstName + ' ' + rawUser.lastName,
        email: rawUser.email,
        locale: 'en',
      },
      update: {},
    });

    await this.workspaceMemberService.upsert({
      where: {
        userId: user.id,
      },
      create: {
        id: v4(),
        userId: user.id,
        workspaceId: workspace.id,
      },
      update: {},
    });

    return user;
  }
}
