import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CommentThreadTargetService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.commentThreadTarget.findFirst;
  findFirstOrThrow =
    this.prismaService.client.commentThreadTarget.findFirstOrThrow;

  findUnique = this.prismaService.client.commentThreadTarget.findUnique;
  findUniqueOrThrow =
    this.prismaService.client.commentThreadTarget.findUniqueOrThrow;

  findMany = this.prismaService.client.commentThreadTarget.findMany;

  // Create
  create = this.prismaService.client.commentThreadTarget.create;
  createMany = this.prismaService.client.commentThreadTarget.createMany;

  // Update
  update = this.prismaService.client.commentThreadTarget.update;
  upsert = this.prismaService.client.commentThreadTarget.upsert;
  updateMany = this.prismaService.client.commentThreadTarget.updateMany;

  // Delete
  delete = this.prismaService.client.commentThreadTarget.delete;
  deleteMany = this.prismaService.client.commentThreadTarget.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.commentThreadTarget.aggregate;

  // Count
  count = this.prismaService.client.commentThreadTarget.count;

  // GroupBy
  groupBy = this.prismaService.client.commentThreadTarget.groupBy;
}
