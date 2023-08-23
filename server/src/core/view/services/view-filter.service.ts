import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ViewFilterService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.viewFilter.findFirst;
  findFirstOrThrow = this.prismaService.client.viewFilter.findFirstOrThrow;

  findUnique = this.prismaService.client.viewFilter.findUnique;
  findUniqueOrThrow = this.prismaService.client.viewFilter.findUniqueOrThrow;

  findMany = this.prismaService.client.viewFilter.findMany;

  // Create
  create = this.prismaService.client.viewFilter.create;
  createMany = this.prismaService.client.viewFilter.createMany;

  // Update
  update = this.prismaService.client.viewFilter.update;
  upsert = this.prismaService.client.viewFilter.upsert;
  updateMany = this.prismaService.client.viewFilter.updateMany;

  // Delete
  delete = this.prismaService.client.viewFilter.delete;
  deleteMany = this.prismaService.client.viewFilter.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.viewFilter.aggregate;

  // Count
  count = this.prismaService.client.viewFilter.count;

  // GroupBy
  groupBy = this.prismaService.client.viewFilter.groupBy;
}
