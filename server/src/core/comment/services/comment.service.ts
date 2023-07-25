import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.comment.findFirst;
  findFirstOrThrow = this.prismaService.client.comment.findFirstOrThrow;

  findUnique = this.prismaService.client.comment.findUnique;
  findUniqueOrThrow = this.prismaService.client.comment.findUniqueOrThrow;

  findMany = this.prismaService.client.comment.findMany;

  // Create
  create = this.prismaService.client.comment.create;
  createMany = this.prismaService.client.comment.createMany;

  // Update
  update = this.prismaService.client.comment.update;
  upsert = this.prismaService.client.comment.upsert;
  updateMany = this.prismaService.client.comment.updateMany;

  // Delete
  delete = this.prismaService.client.comment.delete;
  deleteMany = this.prismaService.client.comment.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.comment.aggregate;

  // Count
  count = this.prismaService.client.comment.count;

  // GroupBy
  groupBy = this.prismaService.client.comment.groupBy;
}
