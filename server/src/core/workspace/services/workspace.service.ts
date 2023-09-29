import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { v4 } from 'uuid';

import { CompanyService } from 'src/core/company/company.service';
import { PersonService } from 'src/core/person/person.service';
import { PipelineProgressService } from 'src/core/pipeline/services/pipeline-progress.service';
import { PipelineStageService } from 'src/core/pipeline/services/pipeline-stage.service';
import { PipelineService } from 'src/core/pipeline/services/pipeline.service';
import { ViewService } from 'src/core/view/services/view.service';
import { PrismaService } from 'src/database/prisma.service';
import { assert } from 'src/utils/assert';
import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pipelineService: PipelineService,
    private readonly companyService: CompanyService,
    private readonly personService: PersonService,
    private readonly pipelineStageService: PipelineStageService,
    private readonly pipelineProgressService: PipelineProgressService,
    private readonly viewService: ViewService,
    private readonly dataSourceService: DataSourceService,
  ) {}

  // Find
  findFirst = this.prismaService.client.workspace.findFirst;
  findFirstOrThrow = this.prismaService.client.workspace.findFirstOrThrow;

  findUnique = this.prismaService.client.workspace.findUnique;
  findUniqueOrThrow = this.prismaService.client.workspace.findUniqueOrThrow;

  findMany = this.prismaService.client.workspace.findMany;

  // Create
  create = this.prismaService.client.workspace.create;
  createMany = this.prismaService.client.workspace.createMany;

  // Update
  update = this.prismaService.client.workspace.update;
  upsert = this.prismaService.client.workspace.upsert;
  updateMany = this.prismaService.client.workspace.updateMany;

  // Delete
  delete = this.prismaService.client.workspace.delete;
  deleteMany = this.prismaService.client.workspace.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.workspace.aggregate;

  // Count
  count = this.prismaService.client.workspace.count;

  // GroupBy
  groupBy = this.prismaService.client.workspace.groupBy;

  // Customs
  async createDefaultWorkspace() {
    const workspace = await this.create({
      data: {
        inviteHash: v4(),
      },
    });

    // Create workspace schema
    await this.dataSourceService.createWorkspaceSchema(workspace.id);

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

    // Create default views
    await this.viewService.createDefaultViews({
      workspaceId: workspace.id,
    });

    return workspace;
  }

  async deleteWorkspace({
    workspaceId,
    select,
    userId,
  }: {
    workspaceId: string;
    select: Prisma.WorkspaceSelect;
    userId: string;
  }) {
    const workspace = await this.findUnique({
      where: { id: workspaceId },
      select,
    });
    assert(workspace, 'Workspace not found');

    const where = { workspaceId };

    const {
      user,
      workspaceMember,
      refreshToken,
      attachment,
      comment,
      activityTarget,
      activity,
      view,
    } = this.prismaService.client;

    const activitys = await activity.findMany({
      where: { authorId: userId },
    });

    await this.prismaService.client.$transaction([
      this.pipelineProgressService.deleteMany({
        where,
      }),
      this.companyService.deleteMany({
        where,
      }),
      this.personService.deleteMany({
        where,
      }),
      this.pipelineStageService.deleteMany({
        where,
      }),
      this.pipelineService.deleteMany({
        where,
      }),
      workspaceMember.deleteMany({
        where,
      }),
      attachment.deleteMany({
        where,
      }),
      comment.deleteMany({
        where,
      }),
      ...activitys.map(({ id: activityId }) =>
        activityTarget.deleteMany({
          where: { activityId },
        }),
      ),
      activity.deleteMany({
        where,
      }),
      view.deleteMany({
        where,
      }),
      refreshToken.deleteMany({
        where: { userId },
      }),
      // Todo delete all users from this workspace
      user.delete({
        where: {
          id: userId,
        },
      }),
      this.delete({ where: { id: workspaceId } }),
    ]);

    return workspace;
  }
}
