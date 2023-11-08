import {
  Command,
  CommandRunner,
  InquirerService,
  Option,
} from 'nest-commander';
import isEqual from 'lodash.isequal';

import { PrismaService } from 'src/database/prisma.service';
import peopleSeed from 'src/core/person/seed-data/people.json';
import companiesSeed from 'src/core/company/seed-data/companies.json';
import pipelineStagesSeed from 'src/core/pipeline/seed-data/pipeline-stages.json';
import pipelinesSeed from 'src/core/pipeline/seed-data/sales-pipeline.json';
import { WorkspaceService } from 'src/core/workspace/services/workspace.service';

interface DataCleanInactiveOptions {
  days?: number;
  sameAsSeedDays?: number;
  dryRun?: boolean;
  confirmation?: boolean;
  workspaceId?: string;
  boundaries?: Array<number>;
}

interface ActivityReport {
  displayName: string;
  maxUpdatedAt: string;
  inactiveDays: number;
}

interface SameAsSeedWorkspace {
  displayName: string;
}

interface DataCleanResults {
  activityReport: { [key: string]: ActivityReport };
  sameAsSeedWorkspaces: { [key: string]: SameAsSeedWorkspace };
}

@Command({
  name: 'workspaces:clean-inactive',
  description: 'Clean inactive workspaces from the public database schema',
})
export class DataCleanInactiveCommand extends CommandRunner {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workspaceService: WorkspaceService,
    private readonly inquiererService: InquirerService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspaceId [workspace id]',
    description: 'Specific workspaceId to apply cleaning',
  })
  parseWorkspace(val: string): string {
    return val;
  }

  @Option({
    flags: '-d, --days [inactive days threshold]',
    description: 'Inactive days threshold',
    defaultValue: 60,
  })
  parseDays(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-s, --same-as-seed-days [same as seed days threshold]',
    description: 'Same as seed days threshold',
  })
  parseSameAsSeedDays(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-b, --boundaries [boundaries]',
    description:
      'Set boundaries for batch cleaning, separated by a comma -> eg: 25,50',
  })
  parseBoundaries(val: string): Array<number> {
    const boundaries = val.split(',');
    if (boundaries.length !== 2) {
      console.error(
        'You must provide 2 integer boundaries separated by a comma, eg: 25,50',
      );
      throw new Error();
    }
    if (boundaries[0] > boundaries[1]) {
      console.error(
        'First boundary should be lower that second boundary, eg: 25,50',
      );
      throw new Error();
    }
    return [Number(boundaries[0]), Number(boundaries[1])];
  }

  @Option({
    flags: '--dry-run [dry run]',
    description: 'List inactive workspaces without removing them',
  })
  parseDryRun(val: string): boolean {
    return Boolean(val);
  }

  // We look for public tables which contains workspaceId and updatedAt columns
  getRelevantTables() {
    return Object.keys(this.prismaService.client).filter(
      (name) =>
        !name.startsWith('_') &&
        !name.startsWith('$') &&
        !name.includes('user') &&
        !name.includes('refreshToken') &&
        !name.includes('workspace') &&
        !name.includes('webHook') &&
        !name.includes('favorite'),
    );
  }

  async getMaxUpdatedAtForAllWorkspaces(tables, workspaces) {
    const result = {};
    for (const table of tables) {
      result[table] = {};
      const groupByWorkspaces = await this.prismaService.client[table].groupBy({
        by: ['workspaceId'],
        _max: { updatedAt: true },
        where: {
          workspaceId: { in: workspaces.map((workspace) => workspace.id) },
        },
      });
      for (const groupByWorkspace of groupByWorkspaces) {
        result[table][groupByWorkspace.workspaceId] =
          groupByWorkspace._max.updatedAt;
      }
    }
    return result;
  }

  async addMaxUpdatedAtToWorkspaces(
    result,
    workspace,
    table,
    maxUpdatedAtForAllWorkspaces,
  ) {
    const newUpdatedAt = maxUpdatedAtForAllWorkspaces[table][workspace.id];
    if (!result.activityReport[workspace.id]) {
      result.activityReport[workspace.id] = {
        displayName: workspace.displayName,
        maxUpdatedAt: null,
      };
    }
    if (
      newUpdatedAt &&
      new Date(result.activityReport[workspace.id].maxUpdatedAt) <
        new Date(newUpdatedAt)
    ) {
      result.activityReport[workspace.id].maxUpdatedAt = newUpdatedAt;
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
      isEqual(people, peopleSeed) &&
      isEqual(companies, companiesSeed) &&
      isEqual(pipelineStages, pipelineStagesSeed) &&
      isEqual(pipelines, [pipelinesSeed])
    ) {
      result.sameAsSeedWorkspaces[workspace.id] = {
        displayName: workspace.displayName,
      };
    }
  }

  async getWorkspaces(options) {
    const where = options.workspaceId
      ? { id: { equals: options.workspaceId } }
      : {};
    const workspaces = await this.prismaService.client.workspace.findMany({
      where,
      orderBy: [{ createdAt: 'asc' }],
    });
    if (options.boundaries) {
      return workspaces.slice(options.boundaries[0], options.boundaries[1] + 1);
    }
    return workspaces;
  }

  async findInactiveWorkspaces(result, options) {
    const workspaces = await this.getWorkspaces(options);
    const tables = this.getRelevantTables();
    const maxUpdatedAtForAllWorkspaces =
      await this.getMaxUpdatedAtForAllWorkspaces(tables, workspaces);
    const totalWorkspacesCount = workspaces.length;
    console.log(totalWorkspacesCount, 'workspace(s) to analyse');
    let workspacesCount = 1;
    for (const workspace of workspaces) {
      console.log(
        `Progress: ${Math.floor(
          (100 * workspacesCount) / totalWorkspacesCount,
        )}% - analysing workspace ${workspace.id} ${workspace.displayName}`,
      );
      workspacesCount += 1;
      if (options.sameAsSeedDays) {
        await this.detectWorkspacesWithSeedDataOnly(result, workspace);
      }
      for (const table of tables) {
        await this.addMaxUpdatedAtToWorkspaces(
          result,
          workspace,
          table,
          maxUpdatedAtForAllWorkspaces,
        );
      }
    }
  }

  filterResults(result, options) {
    for (const workspaceId in result.activityReport) {
      const timeDifferenceInSeconds = Math.abs(
        new Date().getTime() -
          new Date(result.activityReport[workspaceId].maxUpdatedAt).getTime(),
      );
      const timeDifferenceInDays = Math.ceil(
        timeDifferenceInSeconds / (1000 * 3600 * 24),
      );
      if (timeDifferenceInDays < options.sameAsSeedDays) {
        delete result.sameAsSeedWorkspaces[workspaceId];
      }
      if (timeDifferenceInDays < options.days) {
        delete result.activityReport[workspaceId];
      } else {
        result.activityReport[workspaceId].inactiveDays = timeDifferenceInDays;
      }
    }
  }

  async delete(result) {
    if (Object.keys(result.activityReport).length) {
      console.log('Deleting inactive workspaces');
    }
    for (const workspaceId in result.activityReport) {
      process.stdout.write(`- deleting ${workspaceId} ...`);
      await this.workspaceService.deleteWorkspace({
        workspaceId,
      });
      console.log(' done!');
    }
    if (Object.keys(result.sameAsSeedWorkspaces).length) {
      console.log('Deleting same as Seed workspaces');
    }
    for (const workspaceId in result.sameAsSeedWorkspaces) {
      process.stdout.write(`- deleting ${workspaceId} ...`);
      await this.workspaceService.deleteWorkspace({
        workspaceId,
      });
      console.log(' done!');
    }
  }

  displayResults(result) {
    const workspacesToDelete = new Set();
    for (const workspaceId in result.activityReport) {
      workspacesToDelete.add(workspaceId);
    }
    for (const workspaceId in result.sameAsSeedWorkspaces) {
      workspacesToDelete.add(workspaceId);
    }
    console.log(`${workspacesToDelete.size} workspace(s) will be deleted:`);
    console.log(result);
  }

  async run(
    _passedParam: string[],
    options: DataCleanInactiveOptions,
  ): Promise<void> {
    const result: DataCleanResults = {
      activityReport: {},
      sameAsSeedWorkspaces: {},
    };
    await this.findInactiveWorkspaces(result, options);
    this.filterResults(result, options);
    this.displayResults(result);
    if (!options.dryRun) {
      options = await this.inquiererService.ask('confirm', options);
      if (!options.confirmation) {
        console.log('Cleaning aborted');
        return;
      }
    }
    if (!options.dryRun) {
      await this.delete(result);
    }
  }
}
