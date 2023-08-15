import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ViewService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.view.findFirst;
  findFirstOrThrow = this.prismaService.client.view.findFirstOrThrow;

  findUnique = this.prismaService.client.view.findUnique;
  findUniqueOrThrow = this.prismaService.client.view.findUniqueOrThrow;

  findMany = this.prismaService.client.view.findMany;

  // Create
  create = this.prismaService.client.view.create;
  createMany = this.prismaService.client.view.createMany;

  // Update
  update = this.prismaService.client.view.update;
  upsert = this.prismaService.client.view.upsert;
  updateMany = this.prismaService.client.view.updateMany;

  // Delete
  delete = this.prismaService.client.view.delete;
  deleteMany = this.prismaService.client.view.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.view.aggregate;

  // Count
  count = this.prismaService.client.view.count;

  // GroupBy
  groupBy = this.prismaService.client.view.groupBy;
}
