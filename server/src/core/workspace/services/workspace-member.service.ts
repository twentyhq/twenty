import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class WorkspaceMemberService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.workspaceMember.findFirst;
  findFirstOrThrow = this.prismaService.client.workspaceMember.findFirstOrThrow;

  findUnique = this.prismaService.client.workspaceMember.findUnique;
  findUniqueOrThrow =
    this.prismaService.client.workspaceMember.findUniqueOrThrow;

  findMany = this.prismaService.client.workspaceMember.findMany;

  // Create
  create = this.prismaService.client.workspaceMember.create;
  createMany = this.prismaService.client.workspaceMember.createMany;

  // Update
  update = this.prismaService.client.workspaceMember.update;
  upsert = this.prismaService.client.workspaceMember.upsert;
  updateMany = this.prismaService.client.workspaceMember.updateMany;

  // Delete
  delete = this.prismaService.client.workspaceMember.delete;
  deleteMany = this.prismaService.client.workspaceMember.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.workspaceMember.aggregate;

  // Count
  count = this.prismaService.client.workspaceMember.count;

  // GroupBy
  groupBy = this.prismaService.client.workspaceMember.groupBy;
}
