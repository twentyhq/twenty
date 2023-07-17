import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CommentThreadAttachmentService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.commentThreadAttachment.findFirst;
  findFirstOrThrow =
    this.prismaService.commentThreadAttachment.findFirstOrThrow;

  findUnique = this.prismaService.commentThreadAttachment.findUnique;
  findUniqueOrThrow =
    this.prismaService.commentThreadAttachment.findUniqueOrThrow;

  findMany = this.prismaService.commentThreadAttachment.findMany;

  // Create
  create = this.prismaService.commentThreadAttachment.create;
  createMany = this.prismaService.commentThreadAttachment.createMany;

  // Update
  update = this.prismaService.commentThreadAttachment.update;
  upsert = this.prismaService.commentThreadAttachment.upsert;
  updateMany = this.prismaService.commentThreadAttachment.updateMany;

  // Delete
  delete = this.prismaService.commentThreadAttachment.delete;
  deleteMany = this.prismaService.commentThreadAttachment.deleteMany;

  // Aggregate
  aggregate = this.prismaService.commentThreadAttachment.aggregate;

  // Count
  count = this.prismaService.commentThreadAttachment.count;

  // GroupBy
  groupBy = this.prismaService.commentThreadAttachment.groupBy;
}
