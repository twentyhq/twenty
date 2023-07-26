import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.activity.findFirst;
  findFirstOrThrow = this.prismaService.client.activity.findFirstOrThrow;

  findUnique = this.prismaService.client.activity.findUnique;
  findUniqueOrThrow = this.prismaService.client.activity.findUniqueOrThrow;

  findMany = this.prismaService.client.activity.findMany;

  // Create
  create = this.prismaService.client.activity.create;
  createMany = this.prismaService.client.activity.createMany;

  // Update
  update = this.prismaService.client.activity.update;
  upsert = this.prismaService.client.activity.upsert;
  updateMany = this.prismaService.client.activity.updateMany;

  // Delete
  delete = this.prismaService.client.activity.delete;
  deleteMany = this.prismaService.client.activity.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.activity.aggregate;

  // Count
  count = this.prismaService.client.activity.count;

  // GroupBy
  groupBy = this.prismaService.client.activity.groupBy;
}
