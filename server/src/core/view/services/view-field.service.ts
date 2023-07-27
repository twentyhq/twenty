import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ViewFieldService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.viewField.findFirst;
  findFirstOrThrow = this.prismaService.client.viewField.findFirstOrThrow;

  findUnique = this.prismaService.client.viewField.findUnique;
  findUniqueOrThrow = this.prismaService.client.viewField.findUniqueOrThrow;

  findMany = this.prismaService.client.viewField.findMany;

  // Create
  create = this.prismaService.client.viewField.create;
  createMany = this.prismaService.client.viewField.createMany;

  // Update
  update = this.prismaService.client.viewField.update;
  upsert = this.prismaService.client.viewField.upsert;
  updateMany = this.prismaService.client.viewField.updateMany;

  // Delete
  delete = this.prismaService.client.viewField.delete;
  deleteMany = this.prismaService.client.viewField.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.viewField.aggregate;

  // Count
  count = this.prismaService.client.viewField.count;

  // GroupBy
  groupBy = this.prismaService.client.viewField.groupBy;
}
