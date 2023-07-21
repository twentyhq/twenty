import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.comment.findFirst;
  findFirstOrThrow = this.prismaService.comment.findFirstOrThrow;

  findUnique = this.prismaService.comment.findUnique;
  findUniqueOrThrow = this.prismaService.comment.findUniqueOrThrow;

  findMany = this.prismaService.comment.findMany;

  // Create
  create = this.prismaService.comment.create;
  createMany = this.prismaService.comment.createMany;

  // Update
  update = this.prismaService.comment.update;
  upsert = this.prismaService.comment.upsert;
  updateMany = this.prismaService.comment.updateMany;

  // Delete
  delete = this.prismaService.comment.delete;
  deleteMany = this.prismaService.comment.deleteMany;

  // Aggregate
  aggregate = this.prismaService.comment.aggregate;

  // Count
  count = this.prismaService.comment.count;

  // GroupBy
  groupBy = this.prismaService.comment.groupBy;
}
