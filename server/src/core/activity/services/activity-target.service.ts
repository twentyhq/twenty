import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ActivityTargetService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.activityTarget.findFirst;
  findFirstOrThrow = this.prismaService.client.activityTarget.findFirstOrThrow;

  findUnique = this.prismaService.client.activityTarget.findUnique;
  findUniqueOrThrow =
    this.prismaService.client.activityTarget.findUniqueOrThrow;

  findMany = this.prismaService.client.activityTarget.findMany;

  // Create
  create = this.prismaService.client.activityTarget.create;
  createMany = this.prismaService.client.activityTarget.createMany;

  // Update
  update = this.prismaService.client.activityTarget.update;
  upsert = this.prismaService.client.activityTarget.upsert;
  updateMany = this.prismaService.client.activityTarget.updateMany;

  // Delete
  delete = this.prismaService.client.activityTarget.delete;
  deleteMany = this.prismaService.client.activityTarget.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.activityTarget.aggregate;

  // Count
  count = this.prismaService.client.activityTarget.count;

  // GroupBy
  groupBy = this.prismaService.client.activityTarget.groupBy;
}
