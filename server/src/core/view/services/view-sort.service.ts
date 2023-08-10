import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ViewSortService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.viewSort.findFirst;
  findFirstOrThrow = this.prismaService.client.viewSort.findFirstOrThrow;

  findUnique = this.prismaService.client.viewSort.findUnique;
  findUniqueOrThrow = this.prismaService.client.viewSort.findUniqueOrThrow;

  findMany = this.prismaService.client.viewSort.findMany;

  // Create
  create = this.prismaService.client.viewSort.create;
  createMany = this.prismaService.client.viewSort.createMany;

  // Update
  update = this.prismaService.client.viewSort.update;
  upsert = this.prismaService.client.viewSort.upsert;
  updateMany = this.prismaService.client.viewSort.updateMany;

  // Delete
  delete = this.prismaService.client.viewSort.delete;
  deleteMany = this.prismaService.client.viewSort.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.viewSort.aggregate;

  // Count
  count = this.prismaService.client.viewSort.count;

  // GroupBy
  groupBy = this.prismaService.client.viewSort.groupBy;
}
