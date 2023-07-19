import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class WorkspaceMemberService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.workspaceMember.findFirst;
  findFirstOrThrow = this.prismaService.workspaceMember.findFirstOrThrow;

  findUnique = this.prismaService.workspaceMember.findUnique;
  findUniqueOrThrow = this.prismaService.workspaceMember.findUniqueOrThrow;

  findMany = this.prismaService.workspaceMember.findMany;

  // Create
  create = this.prismaService.workspaceMember.create;
  createMany = this.prismaService.workspaceMember.createMany;

  // Update
  update = this.prismaService.workspaceMember.update;
  upsert = this.prismaService.workspaceMember.upsert;
  updateMany = this.prismaService.workspaceMember.updateMany;

  // Delete
  delete = this.prismaService.workspaceMember.delete;
  deleteMany = this.prismaService.workspaceMember.deleteMany;

  // Aggregate
  aggregate = this.prismaService.workspaceMember.aggregate;

  // Count
  count = this.prismaService.workspaceMember.count;

  // GroupBy
  groupBy = this.prismaService.workspaceMember.groupBy;
}
