import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.favorite.findFirst;
  findFirstOrThrow = this.prismaService.client.favorite.findFirstOrThrow;

  findUnique = this.prismaService.client.favorite.findUnique;
  findUniqueOrThrow = this.prismaService.client.favorite.findUniqueOrThrow;

  findMany = this.prismaService.client.favorite.findMany;

  // Create
  create = this.prismaService.client.favorite.create;
  createMany = this.prismaService.client.favorite.createMany;

  // Update
  update = this.prismaService.client.favorite.update;
  upsert = this.prismaService.client.favorite.upsert;
  updateMany = this.prismaService.client.favorite.updateMany;

  // Delete
  delete = this.prismaService.client.favorite.delete;
  deleteMany = this.prismaService.client.favorite.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.favorite.aggregate;

  // Count
  count = this.prismaService.client.favorite.count;

  // GroupBy
  groupBy = this.prismaService.client.favorite.groupBy;
}
