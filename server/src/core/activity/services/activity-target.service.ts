import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ActivityTargetService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.activityTarget.findFirst;
  findFirstOrThrow = this.prismaService.activityTarget.findFirstOrThrow;

  findUnique = this.prismaService.activityTarget.findUnique;
  findUniqueOrThrow = this.prismaService.activityTarget.findUniqueOrThrow;

  findMany = this.prismaService.activityTarget.findMany;

  // Create
  create = this.prismaService.activityTarget.create;
  createMany = this.prismaService.activityTarget.createMany;

  // Update
  update = this.prismaService.activityTarget.update;
  upsert = this.prismaService.activityTarget.upsert;
  updateMany = this.prismaService.activityTarget.updateMany;

  // Delete
  delete = this.prismaService.activityTarget.delete;
  deleteMany = this.prismaService.activityTarget.deleteMany;

  // Aggregate
  aggregate = this.prismaService.activityTarget.aggregate;

  // Count
  count = this.prismaService.activityTarget.count;

  // GroupBy
  groupBy = this.prismaService.activityTarget.groupBy;
}
