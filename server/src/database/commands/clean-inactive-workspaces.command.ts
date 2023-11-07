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
    defaultValue: 10,
  })
  parseSameAsSeedDays(val: string): number {
    return Number(val);
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
        !name.includes('favorite'),
    );
  }

  async getTableMaxUpdatedAt(table, workspace) {
    return await this.prismaService.client[table].aggregate({
      _max: { updatedAt: true },
      where: { workspaceId: { equals: workspace.id } },
    });
  }

  async addMaxUpdatedAtToWorkspaces(result, workspace, table) {
    const newUpdatedAt = await this.getTableMaxUpdatedAt(table, workspace);
    if (!result.activityReport[workspace.id]) {
      result.activityReport[workspace.id] = {
        displayName: workspace.displayName,
        maxUpdatedAt: null,
      };
    }
    if (
      newUpdatedAt &&
      newUpdatedAt._max.updatedAt &&
      new Date(result.activityReport[workspace.id].maxUpdatedAt) <
        new Date(newUpdatedAt._max.updatedAt)
    ) {
      result.activityReport[workspace.id].maxUpdatedAt =
        newUpdatedAt._max.updatedAt;
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

  async findInactiveWorkspaces(result, options) {
    const where = options.workspaceId
      ? { id: { equals: options.workspaceId } }
      : {};
    const workspaces = await this.prismaService.client.workspace.findMany({
      where,
    });
    const tables = this.getRelevantTables();
    for (const workspace of workspaces) {
      await this.detectWorkspacesWithSeedDataOnly(result, workspace);
      for (const table of tables) {
        await this.addMaxUpdatedAtToWorkspaces(result, workspace, table);
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
