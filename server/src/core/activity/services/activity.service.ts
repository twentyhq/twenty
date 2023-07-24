import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.activity.findFirst;
  findFirstOrThrow = this.prismaService.activity.findFirstOrThrow;

  findUnique = this.prismaService.activity.findUnique;
  findUniqueOrThrow = this.prismaService.activity.findUniqueOrThrow;

  findMany = this.prismaService.activity.findMany;

  // Create
  create = this.prismaService.activity.create;
  createMany = this.prismaService.activity.createMany;

  // Update
  update = this.prismaService.activity.update;
  upsert = this.prismaService.activity.upsert;
  updateMany = this.prismaService.activity.updateMany;

  // Delete
  delete = this.prismaService.activity.delete;
  deleteMany = this.prismaService.activity.deleteMany;

  // Aggregate
  aggregate = this.prismaService.activity.aggregate;

  // Count
  count = this.prismaService.activity.count;

  // GroupBy
  groupBy = this.prismaService.activity.groupBy;
}
