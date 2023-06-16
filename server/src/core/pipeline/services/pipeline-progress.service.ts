import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PipelineProgressService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.pipelineProgress.findFirst;
  findFirstOrThrow = this.prismaService.pipelineProgress.findFirstOrThrow;

  findUnique = this.prismaService.pipelineProgress.findUnique;
  findUniqueOrThrow = this.prismaService.pipelineProgress.findUniqueOrThrow;

  findMany = this.prismaService.pipelineProgress.findMany;

  // Create
  create = this.prismaService.pipelineProgress.create;
  createMany = this.prismaService.pipelineProgress.createMany;

  // Update
  update = this.prismaService.pipelineProgress.update;
  upsert = this.prismaService.pipelineProgress.upsert;
  updateMany = this.prismaService.pipelineProgress.updateMany;

  // Delete
  delete = this.prismaService.pipelineProgress.delete;
  deleteMany = this.prismaService.pipelineProgress.deleteMany;

  // Aggregate
  aggregate = this.prismaService.pipelineProgress.aggregate;

  // Count
  count = this.prismaService.pipelineProgress.count;

  // GroupBy
  groupBy = this.prismaService.pipelineProgress.groupBy;
}
