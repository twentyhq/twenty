import { Command, CommandRunner, Option } from 'nest-commander';

import { PrismaService } from 'src/database/prisma.service';
import peopleSeed from 'src/core/person/seed-data/people.json';
import companiesSeed from 'src/core/company/seed-data/companies.json';
import pipelineStagesSeed from 'src/core/pipeline/seed-data/pipeline-stages.json';
import pipelinesSeed from 'src/core/pipeline/seed-data/sales-pipeline.json';
import { arraysEqual } from 'src/utils/equal';

interface DataCleanInactiveOptions {
  days?: number;
}

@Command({
  name: 'workspaces:clean-inactive',
  description: 'Clean inactive workspaces from the public database schema',
})
export class DataCleanInactiveCommand extends CommandRunner {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  @Option({
    flags: '-d, --days [days]',
    description: 'Inactive days threshold',
  })
  parseDays(val: string): number {
    return Number(val);
  }

  // We look for public tables which contains workspaceId and updatedAt columns
  getRelevantTables() {
    return Object.keys(this.prismaService.client).filter(
      (name) =>
        !name.startsWith('_') &&
        !name.startsWith('$') &&
        !name.includes('user') &&
        !name.includes('refreshToken') &&
        !name.includes('workspace'),
    );
  }

  async getTableMaxUpdatedAt(table, workspace) {
    try {
      return await this.prismaService.client[table].aggregate({
        _max: { updatedAt: true },
        where: { workspaceId: { equals: workspace.id } },
      });
    } catch (e) {}
  }

  updateResult(result, workspace, newUpdatedAt) {
    if (!result.activityReport[workspace.id])
      result.activityReport[workspace.id] = null;
    if (
      newUpdatedAt &&
      newUpdatedAt._max.updatedAt &&
      new Date(result.activityReport[workspace.id]) <
        new Date(newUpdatedAt._max.updatedAt)
    ) {
      result.activityReport[workspace.id] = newUpdatedAt._max.updatedAt;
    }
  }

  async detectWorkspacesWithSeedDataOnly(result, workspace) {
    const companies = await this.prismaService.client.company.findMany({
      select: { name: true, domainName: true, address: true, employees: true },
      where: { workspaceId: { equals: workspace.id } },
    });
    const people = await this.prismaService.client.person.findMany({
      select: {
        firstName: true,
        lastName: true,
        city: true,
        email: true,
        avatarUrl: true,
      },
      where: { workspaceId: { equals: workspace.id } },
    });
    const pipelineStages =
      await this.prismaService.client.pipelineStage.findMany({
        select: {
          name: true,
          color: true,
          position: true,
          type: true,
        },
        where: { workspaceId: { equals: workspace.id } },
      });
    const pipelines = await this.prismaService.client.pipeline.findMany({
      select: {
        name: true,
        icon: true,
        pipelineProgressableType: true,
      },
      where: { workspaceId: { equals: workspace.id } },
    });
    if (
      arraysEqual(people, peopleSeed) &&
      arraysEqual(companies, companiesSeed) &&
      arraysEqual(pipelineStages, pipelineStagesSeed) &&
      arraysEqual(pipelines, [pipelinesSeed])
    ) {
      result.sameAsSeedWorkspaces.push(workspace.id);
    }
  }

  enrichResults(result, days) {
    for (const key in result.activityReport) {
      const timeDifferenceInSeconds = Math.abs(
        new Date().getTime() - new Date(result.activityReport[key]).getTime(),
      );
      const timeDifferenceInDays = Math.ceil(
        timeDifferenceInSeconds / (1000 * 3600 * 24),
      );
      if (timeDifferenceInDays < days) {
        delete result.activityReport[key];
      } else {
        result.activityReport[key] = `${result.activityReport[
          key
        ].toISOString()} -> Inactive since ${timeDifferenceInDays} days`;
      }
    }
  }

  async run(
    _passedParam: string[],
    options?: DataCleanInactiveOptions,
  ): Promise<void> {
    const result = { activityReport: {}, sameAsSeedWorkspaces: [] };
    const workspaces = await this.prismaService.client.workspace.findMany();
    const tables = this.getRelevantTables();
    for (const workspace of workspaces) {
      await this.detectWorkspacesWithSeedDataOnly(result, workspace);
      for (const table of tables) {
        const maxUpdatedAt = await this.getTableMaxUpdatedAt(table, workspace);
        this.updateResult(result, workspace, maxUpdatedAt);
      }
    }
    this.enrichResults(result, options?.days);
    console.log(result);
  }
}
