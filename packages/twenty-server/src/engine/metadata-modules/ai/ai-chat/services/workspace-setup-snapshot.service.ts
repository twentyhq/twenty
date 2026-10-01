import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { FieldActorSource } from 'twenty-shared/types';
import { DataSource } from 'typeorm';

import { WORKSPACE_SETUP_SNAPSHOT_EMAIL_WINDOW_DAYS } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-snapshot-email-window-days.constant';
import {
  type WorkspaceSetupEmailCompany,
  type WorkspaceSetupEmailContact,
  type WorkspaceSetupMailbox,
  type WorkspaceSetupSnapshot,
} from 'src/engine/metadata-modules/ai/ai-chat/types/workspace-setup-snapshot.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const TOP_EMAIL_COMPANIES_LIMIT = 8;
const TOP_EMAIL_CONTACTS_LIMIT = 5;
const SAMPLE_COMPANY_NAMES_LIMIT = 10;

type CountsRow = {
  importedMessageCount: number;
  ownPersonCount: number;
  ownCompanyCount: number;
  ownOpportunityCount: number;
};

type TopEmailContactRow = {
  personId: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  threadCount: number;
  lastEmailAt: Date;
};

@Injectable()
export class WorkspaceSetupSnapshotService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getSnapshot({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<WorkspaceSetupSnapshot> {
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    const [
      mailboxes,
      [counts],
      sampleCompanyRows,
      topEmailCompanies,
      topEmailContactRows,
    ] = await Promise.all([
      this.dataSource.query<WorkspaceSetupMailbox[]>(
        `SELECT mc.handle, mc."syncStatus", mc."syncStage"
         FROM core."messageChannel" mc
         JOIN core."connectedAccount" ca ON ca.id = mc."connectedAccountId"
         WHERE ca."workspaceId" = $1 AND ca."userWorkspaceId" = $2
           AND ca."archivedAt" IS NULL AND mc.type = 'EMAIL'`,
        [workspaceId, userWorkspaceId],
      ),
      this.dataSource.query<CountsRow[]>(
        `SELECT
           (SELECT count(*)::int FROM ${schema}."message" WHERE "deletedAt" IS NULL) AS "importedMessageCount",
           (SELECT count(*)::int FROM ${schema}."person" WHERE "deletedAt" IS NULL AND "createdBySource"::text <> $1) AS "ownPersonCount",
           (SELECT count(*)::int FROM ${schema}."company" WHERE "deletedAt" IS NULL AND "createdBySource"::text <> $1) AS "ownCompanyCount",
           (SELECT count(*)::int FROM ${schema}."opportunity" WHERE "deletedAt" IS NULL AND "createdBySource"::text <> $1) AS "ownOpportunityCount"`,
        [FieldActorSource.SYSTEM],
      ),
      this.dataSource.query<{ name: string }[]>(
        `SELECT name FROM ${schema}."company"
         WHERE "deletedAt" IS NULL AND "createdBySource"::text = $1
         ORDER BY name LIMIT ${SAMPLE_COMPANY_NAMES_LIMIT}`,
        [FieldActorSource.SYSTEM],
      ),
      this.dataSource.query<WorkspaceSetupEmailCompany[]>(
        `SELECT c.id AS "companyId", c.name,
           count(DISTINCT m."messageThreadId")::int AS "threadCount",
           max(m."receivedAt") AS "lastEmailAt",
           (SELECT count(*)::int FROM ${schema}."opportunity" o
            WHERE o."companyId" = c.id AND o."deletedAt" IS NULL) AS "opportunityCount"
         FROM ${schema}."messageParticipant" mp
         JOIN ${schema}."message" m ON m.id = mp."messageId" AND m."deletedAt" IS NULL
         JOIN ${schema}."person" p ON p.id = mp."personId" AND p."deletedAt" IS NULL
         JOIN ${schema}."company" c ON c.id = p."companyId" AND c."deletedAt" IS NULL
         WHERE mp."deletedAt" IS NULL AND c."createdBySource"::text <> $1
           AND m."receivedAt" > now() - make_interval(days => $2::int)
         GROUP BY c.id, c.name
         ORDER BY "threadCount" DESC, "lastEmailAt" DESC
         LIMIT ${TOP_EMAIL_COMPANIES_LIMIT}`,
        [FieldActorSource.SYSTEM, WORKSPACE_SETUP_SNAPSHOT_EMAIL_WINDOW_DAYS],
      ),
      this.dataSource.query<TopEmailContactRow[]>(
        `SELECT p.id AS "personId", p."nameFirstName" AS "firstName",
           p."nameLastName" AS "lastName", c.name AS "companyName",
           count(DISTINCT m."messageThreadId")::int AS "threadCount",
           max(m."receivedAt") AS "lastEmailAt"
         FROM ${schema}."messageParticipant" mp
         JOIN ${schema}."message" m ON m.id = mp."messageId" AND m."deletedAt" IS NULL
         JOIN ${schema}."person" p ON p.id = mp."personId" AND p."deletedAt" IS NULL
         LEFT JOIN ${schema}."company" c ON c.id = p."companyId" AND c."deletedAt" IS NULL
         WHERE mp."deletedAt" IS NULL AND p."createdBySource"::text <> $1
           AND m."receivedAt" > now() - make_interval(days => $2::int)
         GROUP BY p.id, p."nameFirstName", p."nameLastName", c.name
         ORDER BY "threadCount" DESC, "lastEmailAt" DESC
         LIMIT ${TOP_EMAIL_CONTACTS_LIMIT}`,
        [FieldActorSource.SYSTEM, WORKSPACE_SETUP_SNAPSHOT_EMAIL_WINDOW_DAYS],
      ),
    ]);

    return {
      readAt: new Date(),
      mailboxes,
      ...counts,
      sampleCompanyNames: sampleCompanyRows.map(({ name }) => name),
      topEmailCompanies,
      topEmailContacts: topEmailContactRows.map(
        ({ firstName, lastName, ...contact }): WorkspaceSetupEmailContact => ({
          ...contact,
          name: [firstName, lastName].filter(isNonEmptyString).join(' '),
        }),
      ),
    };
  }
}
