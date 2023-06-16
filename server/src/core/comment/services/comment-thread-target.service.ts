import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CommentThreadTargetService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.commentThreadTarget.findFirst;
  findFirstOrThrow = this.prismaService.commentThreadTarget.findFirstOrThrow;

  findUnique = this.prismaService.commentThreadTarget.findUnique;
  findUniqueOrThrow = this.prismaService.commentThreadTarget.findUniqueOrThrow;

  findMany = this.prismaService.commentThreadTarget.findMany;

  // Create
  create = this.prismaService.commentThreadTarget.create;
  createMany = this.prismaService.commentThreadTarget.createMany;

  // Update
  update = this.prismaService.commentThreadTarget.update;
  upsert = this.prismaService.commentThreadTarget.upsert;
  updateMany = this.prismaService.commentThreadTarget.updateMany;

  // Delete
  delete = this.prismaService.commentThreadTarget.delete;
  deleteMany = this.prismaService.commentThreadTarget.deleteMany;

  // Aggregate
  aggregate = this.prismaService.commentThreadTarget.aggregate;

  // Count
  count = this.prismaService.commentThreadTarget.count;

  // GroupBy
  groupBy = this.prismaService.commentThreadTarget.groupBy;
}
