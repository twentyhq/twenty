import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.workspace.findFirst;
  findFirstOrThrow = this.prismaService.workspace.findFirstOrThrow;

  findUnique = this.prismaService.workspace.findUnique;
  findUniqueOrThrow = this.prismaService.workspace.findUniqueOrThrow;

  findMany = this.prismaService.workspace.findMany;

  // Create
  create = this.prismaService.workspace.create;
  createMany = this.prismaService.workspace.createMany;

  // Update
  update = this.prismaService.workspace.update;
  upsert = this.prismaService.workspace.upsert;
  updateMany = this.prismaService.workspace.updateMany;

  // Delete
  delete = this.prismaService.workspace.delete;
  deleteMany = this.prismaService.workspace.deleteMany;

  // Aggregate
  aggregate = this.prismaService.workspace.aggregate;

  // Count
  count = this.prismaService.workspace.count;

  // GroupBy
  groupBy = this.prismaService.workspace.groupBy;
}
