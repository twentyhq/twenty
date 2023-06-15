import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CommentThreadService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.commentThread.findFirst;
  findFirstOrThrow = this.prismaService.commentThread.findFirstOrThrow;

  findUnique = this.prismaService.commentThread.findUnique;
  findUniqueOrThrow = this.prismaService.commentThread.findUniqueOrThrow;

  findMany = this.prismaService.commentThread.findMany;

  // Create
  create = this.prismaService.commentThread.create;
  createMany = this.prismaService.commentThread.createMany;

  // Update
  update = this.prismaService.commentThread.update;
  upsert = this.prismaService.commentThread.upsert;
  updateMany = this.prismaService.commentThread.updateMany;

  // Delete
  delete = this.prismaService.commentThread.delete;
  deleteMany = this.prismaService.commentThread.deleteMany;

  // Aggregate
  aggregate = this.prismaService.commentThread.aggregate;

  // Count
  count = this.prismaService.commentThread.count;

  // GroupBy
  groupBy = this.prismaService.commentThread.groupBy;
}
