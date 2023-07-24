import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { PipelineStageService } from 'src/core/pipeline/services/pipeline-stage.service';
import { PipelineService } from 'src/core/pipeline/services/pipeline.service';
import { PrismaService } from 'src/database/prisma.service';
import { CompanyService } from 'src/core/company/company.service';
import { PersonService } from 'src/core/person/person.service';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pipelineService: PipelineService,
    private readonly companyService: CompanyService,
    private readonly personService: PersonService,
    private readonly pipelineStageService: PipelineStageService,
  ) {}

  // Find
  findFirst = this.prismaService.workspace.findFirst;
  findFirstOrThrow = this.prismaService.workspace.findFirstOrThrow;

  findUnique = this.prismaService.workspace.findUnique;
  findUniqueOrThrow = this.prismaService.workspace.findUniqueOrThrow;

  findMany = this.prismaService.workspace.findMany;

  // Create
  create = this.prismaService.workspace.create;
  createMany = this.prismaService.workspace.createMany;

  // Update
  update = this.prismaService.workspace.update;
  upsert = this.prismaService.workspace.upsert;
  updateMany = this.prismaService.workspace.updateMany;

  // Delete
  delete = this.prismaService.workspace.delete;
  deleteMany = this.prismaService.workspace.deleteMany;

  // Aggregate
  aggregate = this.prismaService.workspace.aggregate;

  // Count
  count = this.prismaService.workspace.count;

  // GroupBy
  groupBy = this.prismaService.workspace.groupBy;

  // Customs
  async createDefaultWorkspace() {
    const workspace = await this.create({
      data: {
        inviteHash: v4(),
      },
    });

    // Create default companies
    const companies = await this.companyService.createDefaultCompanies({
      workspaceId: workspace.id,
    });

    // Create default people
    await this.personService.createDefaultPeople({
      workspaceId: workspace.id,
      companies,
    });

    // Create default pipeline
    const pipeline = await this.pipelineService.createDefaultPipeline({
      workspaceId: workspace.id,
    });

    // Create default stages
    await this.pipelineStageService.createDefaultPipelineStages({
      pipelineId: pipeline.id,
      workspaceId: workspace.id,
    });

    return workspace;
  }

  async deleteWorkspace(id: string, select: any) {
    const workspace = await this.findUnique({ where: { id }, select });

    // Get workspace companies
    const companies = await this.companyService.findMany({
      where: { workspaceId: id },
    });

    // get workspace people
    const people = await this.personService.findMany({
      where: { workspaceId: id },
    });

    // get workspace pipelines
    const pipelines = await this.pipelineService.findMany({
      where: { workspaceId: id },
    });

    // get workspace stages
    const stages = await this.pipelineStageService.findMany({
      where: { workspaceId: id },
    });

    // TODO: Determine order of deletion
    // Perhaps we don't delete immediately but instead schedule for deletion

    console.log({ companies, people, pipelines, stages });

    return workspace;
  }
}
