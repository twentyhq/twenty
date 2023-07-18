import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AttachmentService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.attachment.findFirst;
  findFirstOrThrow = this.prismaService.attachment.findFirstOrThrow;

  findUnique = this.prismaService.attachment.findUnique;
  findUniqueOrThrow = this.prismaService.attachment.findUniqueOrThrow;

  findMany = this.prismaService.attachment.findMany;

  // Create
  create = this.prismaService.attachment.create;
  createMany = this.prismaService.attachment.createMany;

  // Update
  update = this.prismaService.attachment.update;
  upsert = this.prismaService.attachment.upsert;
  updateMany = this.prismaService.attachment.updateMany;

  // Delete
  delete = this.prismaService.attachment.delete;
  deleteMany = this.prismaService.attachment.deleteMany;

  // Aggregate
  aggregate = this.prismaService.attachment.aggregate;

  // Count
  count = this.prismaService.attachment.count;

  // GroupBy
  groupBy = this.prismaService.attachment.groupBy;
}
