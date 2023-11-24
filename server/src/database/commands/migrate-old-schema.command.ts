import { Command, CommandRunner, Option } from 'nest-commander';
import { Client } from 'pg';
import getUuidByString from 'uuid-by-string';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { WorkspaceManagerService } from 'src/workspace/workspace-manager/workspace-manager.service';

interface MigrateOldSchemaOptions {
  workspaceIds?: string[];
}

const performQuery = async (query: string) => {
  const client = new Client({
    user: 'twenty_read_only',
    host: 'localhost',
    database: 'default',
    password: '<ASK_ADMIN>',
    port: 5433,
  });
  await client.connect();
  const result = await client.query(query);
  await client.end();
  return result.rows;
};
@Command({
  name: 'database:migrate-old-schema',
  description: 'Migrate old database data into new database',
})
export class MigrateOldSchemaCommand extends CommandRunner {
  constructor(
    private readonly typeOrmService: TypeORMService,
    private readonly workspaceManagerService: WorkspaceManagerService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspaceIds [workspace ids]',
    description: 'A list of workspace ids to migrate',
  })
  parseWorkspace(val: string): string[] {
    return val.split(',');
  }

  formatPipelineProgresses(pipelineProgresses) {
    return pipelineProgresses.map((pipelineProgresse) => {
      return {
        ...pipelineProgresse,
        amountAmountMicros: pipelineProgresse.amountAmountMicros
          ? 1000000 * pipelineProgresse.amountAmountMicros
          : pipelineProgresse.amountAmountMicros,
      };
    });
  }

  filterDataByWorkspace(data, workspaceId) {
    return data.reduce((filtered, elem) => {
      if (elem.workspaceId === workspaceId) {
        delete elem.workspaceId;
        filtered.push(elem);
      }
      return filtered;
    }, []);
  }

  async copyData(table, data, workspaceId) {
    const filteredByWorkspace = this.filterDataByWorkspace(data, workspaceId);
    if (!filteredByWorkspace.length) {
      return;
    }
    const columns = Object.keys(filteredByWorkspace[0]);
    await this.workspaceManagerService.injectWorkspaceData(
      table,
      workspaceId.includes('twenty-')
        ? getUuidByString(workspaceId)
        : workspaceId,
      filteredByWorkspace,
      columns,
    );
  }

  cleanIds(values, key = 'id') {
    return values.map((value) => {
      return {
        ...value,
        [key]:
          value[key] && value[key].includes('twenty-')
            ? getUuidByString(value[key])
            : value[key],
      };
    });
  }

  async getWorkspaces(options) {
    let query = 'SELECT * FROM public.workspaces';
    if (options.workspaceIds) {
      query += ` WHERE id IN ('${options.workspaceIds.join("','")}')`;
    }
    return await performQuery(query);
  }

  getPublicColumns(data) {
    if (!data.length) {
      return [];
    }
    return Object.keys(data[0]).filter((column) => column !== 'workspaceId');
  }

  async copyPublicData() {
    process.stdout.write("Copying 'public' schema data ...");
    const users = this.cleanIds(
      this.cleanIds(
        await performQuery(`
        SELECT
            u."id",
            COALESCE("firstName", '') AS "firstName",
            COALESCE("lastName", '') AS "lastName",
            "email",
            "emailVerified",
            "disabled",
            "passwordHash",
            "canImpersonate",
            w."workspaceId" AS "defaultWorkspaceId",
            u."createdAt",
            u."updatedAt",
            u."deletedAt"
        FROM public."users" AS u
        LEFT JOIN public."workspace_members" AS w
        ON w."userId"=u.id
    `),
      ),
      'defaultWorkspaceId',
    );
    const refreshTokens = this.cleanIds(
      this.cleanIds(
        await performQuery(
          `SELECT
            r."id",
            r."userId",
            r."expiresAt",
            r."revokedAt",
            r."createdAt",
            r."updatedAt",
            r."deletedAt"
        FROM public."refresh_tokens" AS r
        `,
        ),
      ),
      'userId',
    );
    const workspaces = this.cleanIds(await this.getWorkspaces({}));
    await this.workspaceManagerService.injectPublicData(
      'workspace',
      workspaces,
      this.getPublicColumns(workspaces),
    );
    await this.workspaceManagerService.injectPublicData(
      'user',
      users,
      this.getPublicColumns(users),
    );
    await this.workspaceManagerService.updateDefaultWorkspaceIds(users);
    await this.workspaceManagerService.injectPublicData(
      'refreshToken',
      refreshTokens,
      this.getPublicColumns(refreshTokens),
    );
    console.log('Done');
  }

  async run(
    _passedParam: string[],
    options: MigrateOldSchemaOptions,
  ): Promise<void> {
    try {
      const workspaces = await this.getWorkspaces(options);
      console.log(`Migrating \x1b[36m${workspaces.length}\x1b[0m workspace(s)`);
      await this.copyPublicData();
      process.stdout.write('Requesting data from old production ');
      const workspaceMembers: Array<any> = this.cleanIds(
        this.cleanIds(
          await performQuery(`
            SELECT
                w.id,
                w."createdAt",
                w."updatedAt",
                w."deletedAt",
                u."firstName" AS "nameFirstName",
                u."lastName" AS "nameLastName",
                u."avatarUrl",
                w."userId",
                s."colorScheme",
                s.locale,
                w."workspaceId"
            FROM public."workspace_members" AS w 
            JOIN public."users" AS u 
            ON w."userId"=u.id
            JOIN public."user_settings" AS s
            ON s."id"=w."settingsId"
        `),
        ),
        'userId',
      );
      process.stdout.write('.');
      const rawActivities: object[] = this.cleanIds(
        await performQuery(`
            SELECT
                a."id",
                a."createdAt",
                a."updatedAt",
                a."deletedAt",
                a."title",
                a."body",
                a."type",
                a."reminderAt",
                a."dueAt",
                a."completedAt",
                a."workspaceId",
                w.id AS "authorId",
                w2.id AS "assigneeId"
            FROM public."activities" AS a
            JOIN public."workspace_members" AS w ON a."authorId"=w."userId"
            JOIN public."workspace_members" AS w2 ON a."assigneeId"=w2."userId"
            `),
      );
      process.stdout.write('.');
      const rawActivitiesNullAssignees: object[] = this.cleanIds(
        await performQuery(`
            SELECT
                a."id",
                a."createdAt",
                a."updatedAt",
                a."deletedAt",
                a."title",
                a."body",
                a."type",
                a."reminderAt",
                a."dueAt",
                a."completedAt",
                a."workspaceId",
                w.id AS "authorId",
                a."assigneeId"
            FROM public."activities" AS a
            JOIN public."workspace_members" AS w ON a."authorId"=w."userId"
            WHERE a."assigneeId" IS NULL
            `),
      );
      process.stdout.write('.');
      const activities: Array<any> = rawActivities.concat(
        rawActivitiesNullAssignees,
      );
      const rawCompanies: object[] = await performQuery(`
            SELECT
                c."id",
                c."name",
                c."domainName",
                c."address",
                c."employees",
                c."linkedinUrl" AS "linkedinLinkUrl",
                c."xUrl" AS "xLinkUrl",
                c."annualRecurringRevenue" AS "annualRecurringRevenueAmountMicros",
                c."idealCustomerProfile",
                w."id" AS "accountOwnerId",
                c."createdAt",
                c."updatedAt",
                c."deletedAt",
                c."workspaceId"
            FROM public."companies" AS c
            JOIN public."workspace_members" AS w ON c."accountOwnerId"=w."userId"
        `);
      process.stdout.write('.');
      const rawCompaniesNullAccountOwnerId: object[] = await performQuery(`
            SELECT
                "id",
                "name",
                "domainName",
                "address",
                "employees",
                "linkedinUrl" AS "linkedinLinkUrl",
                "xUrl" AS "xLinkUrl",
                "annualRecurringRevenue" AS "annualRecurringRevenueAmountMicros",
                "idealCustomerProfile",
                "accountOwnerId",
                "createdAt",
                "updatedAt",
                "deletedAt",
                "workspaceId"
            FROM public."companies"
            WHERE "accountOwnerId" IS NULL
        `);
      process.stdout.write('.');
      const companies: Array<any> = rawCompanies.concat(
        rawCompaniesNullAccountOwnerId,
      );
      const peopleAvatarNotNull: Array<any> = await performQuery(
        `SELECT
             "id",
             "email",
             "phone",
             "city",
             "companyId",
             "firstName" AS "nameFirstName",
             "lastName" AS "nameLastName",
             "jobTitle",
             "linkedinUrl" AS "linkedinLinkUrl",
             "avatarUrl",
             "xUrl" AS "xLinkUrl",
             "createdAt",
             "updatedAt",
             "deletedAt",
             "workspaceId"
            FROM public."people"
            WHERE "avatarUrl" IS NOT NULL
            `,
      );
      process.stdout.write('.');
      const peopleAvatarNull: Array<any> = await performQuery(
        `SELECT
             "id",
             "email",
             "phone",
             "city",
             "companyId",
             "firstName" AS "nameFirstName",
             "lastName" AS "nameLastName",
             "jobTitle",
             "linkedinUrl" AS "linkedinLinkUrl",
             '' AS "avatarUrl",
             "xUrl" AS "xLinkUrl",
             "createdAt",
             "updatedAt",
             "deletedAt",
             "workspaceId"
            FROM public."people"
            WHERE "avatarUrl" IS NULL
            `,
      );
      process.stdout.write('.');
      const people = peopleAvatarNull.concat(peopleAvatarNotNull);
      const activityTargets: Array<any> = await performQuery(
        `SELECT * FROM public."activity_targets"`,
      );
      process.stdout.write('.');
      const apiKeys: Array<any> = await performQuery(
        `SELECT * FROM public."api_keys"`,
      );
      process.stdout.write('.');
      const attachments: Array<any> = await performQuery(`
          SELECT
              id,
              "name",
              "fullPath",
              "type",
              "companyId",
              "workspaceMemberAuthorId" AS "authorId",
              "activityId",
              "personId",
              "createdAt",
              "updatedAt",
              "deletedAt",
              "workspaceId"
          FROM public."attachments"
        `);
      process.stdout.write('.');
      const comments: Array<any> = this.cleanIds(
        await performQuery(`
            SELECT
                c."id",
                c."createdAt",
                c."updatedAt",
                c."deletedAt",
                c."body",
                w.id AS "authorId",
                c."activityId",
                c."workspaceId"
            FROM public."comments" AS c
            JOIN public."workspace_members" AS w ON c."authorId"=w."userId"
        `),
        'activityId',
      );
      process.stdout.write('.');
      const pipelineStages: Array<any> = this.cleanIds(
        await performQuery(`
            SELECT
                id,
                "name",
                "color",
                "index" AS "position",
                "createdAt",
                "updatedAt",
                "deletedAt",
                "workspaceId"
            FROM public."pipeline_stages"
        `),
      );
      process.stdout.write('.');
      const pipelineProgresses: Array<any> = this.formatPipelineProgresses(
        this.cleanIds(
          await performQuery(`
            SELECT
                id,
                "amount" AS "amountAmountMicros",
                '' AS "amountCurrencyCode",
                "probability",
                "closeDate",
                "companyId",
                "personId",
                "pipelineStageId" AS "pipelineStepId",
                "pointOfContactId",
                "createdAt",
                "updatedAt",
                "deletedAt",
                "workspaceId"
            FROM public."pipeline_progresses"`),
          'pipelineStepId',
        ),
      );
      console.log(' Done!');
      let count = 1;
      for (const workspace of workspaces) {
        process.stdout.write(`- copying data for ${workspace.id} `);
        await this.copyData('workspaceMember', workspaceMembers, workspace.id);
        process.stdout.write('.');
        await this.copyData('activity', activities, workspace.id);
        process.stdout.write('.');
        await this.copyData('company', companies, workspace.id);
        process.stdout.write('.');
        await this.copyData('person', people, workspace.id);
        process.stdout.write('.');
        await this.copyData('activityTarget', activityTargets, workspace.id);
        process.stdout.write('.');
        await this.copyData('apiKey', apiKeys, workspace.id);
        process.stdout.write('.');
        await this.copyData('attachment', attachments, workspace.id);
        process.stdout.write('.');
        await this.copyData('comment', comments, workspace.id);
        process.stdout.write('.');
        await this.copyData('pipelineStep', pipelineStages, workspace.id);
        process.stdout.write('.');
        await this.copyData('opportunity', pipelineProgresses, workspace.id);
        process.stdout.write('.');
        console.log(
          `done ${Math.floor((1000 * count) / workspaces.length) / 10}%`,
        );
        count += 1;
      }
    } catch (e) {
      console.log(e);
    }
  }
}
