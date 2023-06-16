import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PipelineStageService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.pipelineStage.findFirst;
  findFirstOrThrow = this.prismaService.pipelineStage.findFirstOrThrow;

  findUnique = this.prismaService.pipelineStage.findUnique;
  findUniqueOrThrow = this.prismaService.pipelineStage.findUniqueOrThrow;

  findMany = this.prismaService.pipelineStage.findMany;

  // Create
  create = this.prismaService.pipelineStage.create;
  createMany = this.prismaService.pipelineStage.createMany;

  // Update
  update = this.prismaService.pipelineStage.update;
  upsert = this.prismaService.pipelineStage.upsert;
  updateMany = this.prismaService.pipelineStage.updateMany;

  // Delete
  delete = this.prismaService.pipelineStage.delete;
  deleteMany = this.prismaService.pipelineStage.deleteMany;

  // Aggregate
  aggregate = this.prismaService.pipelineStage.aggregate;

  // Count
  count = this.prismaService.pipelineStage.count;

  // GroupBy
  groupBy = this.prismaService.pipelineStage.groupBy;
}
