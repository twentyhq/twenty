import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CommentThreadService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.commentThread.findFirst;
  findFirstOrThrow = this.prismaService.client.commentThread.findFirstOrThrow;

  findUnique = this.prismaService.client.commentThread.findUnique;
  findUniqueOrThrow = this.prismaService.client.commentThread.findUniqueOrThrow;

  findMany = this.prismaService.client.commentThread.findMany;

  // Create
  create = this.prismaService.client.commentThread.create;
  createMany = this.prismaService.client.commentThread.createMany;

  // Update
  update = this.prismaService.client.commentThread.update;
  upsert = this.prismaService.client.commentThread.upsert;
  updateMany = this.prismaService.client.commentThread.updateMany;

  // Delete
  delete = this.prismaService.client.commentThread.delete;
  deleteMany = this.prismaService.client.commentThread.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.commentThread.aggregate;

  // Count
  count = this.prismaService.client.commentThread.count;

  // GroupBy
  groupBy = this.prismaService.client.commentThread.groupBy;
}
