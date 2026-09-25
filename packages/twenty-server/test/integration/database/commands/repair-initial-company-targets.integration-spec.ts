import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { randomUUID } from 'crypto';

import { type RepairInitialCompanyTargetsCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790339692474-repair-initial-company-targets.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TABLE_NAMES = [
  'company',
  'person',
  'messageThread',
  'message',
  'messageParticipant',
  'calendarEvent',
  'calendarEventParticipant',
  'timelineActivity',
  'messageThreadTarget',
  'calendarEventTarget',
] as const;
const TARGET_TABLE_NAMES = [
  'messageThreadTarget',
  'calendarEventTarget',
] as const;
const IMPORTED_AT = '2026-01-01T00:00:00.000Z';
const ASSIGNED_AT = '2026-06-01T00:00:00.000Z';

type TargetTableName = (typeof TARGET_TABLE_NAMES)[number];
type TargetRow = {
  id: string;
  targetCompanyId: string;
  isAutomaticallyAssigned: boolean;
  isManuallyAssigned: boolean;
  deletedAt: Date | null;
};

describe('repair initial company activity targets (PostgreSQL)', () => {
  const workspaceId = randomUUID();
  const schemaName = getWorkspaceSchemaName(workspaceId);
  let command: RepairInitialCompanyTargetsCommand;
  let companyId: string;
  let personId: string;
  let messageThreadId: string;
  let calendarEventId: string;

  const insert = async (
    tableName: (typeof TABLE_NAMES)[number],
    values: Record<string, unknown>,
  ) => {
    const id = randomUUID();
    const row = { id, ...values };
    const columns = Object.keys(row);

    await global.testDataSource.query(
      `INSERT INTO "${schemaName}"."${tableName}" (${columns.map((column) => `"${column}"`).join(', ')})
       VALUES (${columns.map((_, index) => `$${index + 1}`).join(', ')})`,
      Object.values(row),
    );

    return id;
  };

  const assignmentProperties = (
    before: string | null,
    after: string | null,
  ) => ({
    diff: { company: { before: { id: before }, after: { id: after } } },
  });

  const targets = (tableName: TargetTableName): Promise<TargetRow[]> =>
    global.testDataSource.query<TargetRow[]>(
      `SELECT "id", "targetCompanyId", "isAutomaticallyAssigned", "isManuallyAssigned", "deletedAt"
       FROM "${schemaName}"."${tableName}" ORDER BY "id"`,
    );

  const parent = (tableName: TargetTableName) =>
    tableName === 'messageThreadTarget'
      ? { messageThreadId }
      : { calendarEventId };

  const runRepair = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId,
      dataSource: global.testDataSource,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  beforeAll(async () => {
    command = getAppProviderByClassName<RepairInitialCompanyTargetsCommand>(
      'RepairInitialCompanyTargetsCommand',
    );
    jest.spyOn(command['logger'], 'log').mockImplementation();
    jest.spyOn(command['logger'], 'warn').mockImplementation();

    await global.testDataSource.query(`CREATE SCHEMA "${schemaName}"`);
    const sourceSchema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

    // Clone the actual workspace column types, defaults, and indexes without
    // allowing a repair test to touch another suite's seeded records.
    for (const tableName of TABLE_NAMES) {
      await global.testDataSource.query(
        `CREATE TABLE "${schemaName}"."${tableName}" (LIKE "${sourceSchema}"."${tableName}" INCLUDING ALL)`,
      );
    }
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`,
    );
  });

  beforeEach(async () => {
    await global.testDataSource.query(
      `TRUNCATE ${TABLE_NAMES.map((tableName) => `"${schemaName}"."${tableName}"`).join(', ')}`,
    );
    companyId = await insert('company', { name: 'Initial company' });
    personId = await insert('person', { companyId, createdAt: IMPORTED_AT });
    messageThreadId = await insert('messageThread', {});
    const messageId = await insert('message', {
      messageThreadId,
      receivedAt: IMPORTED_AT,
    });

    await insert('messageParticipant', {
      messageId,
      personId,
      role: 'FROM',
      handle: 'imported@example.com',
      createdAt: IMPORTED_AT,
    });
    calendarEventId = await insert('calendarEvent', {
      title: 'Imported meeting',
      startsAt: IMPORTED_AT,
    });
    await insert('calendarEventParticipant', {
      calendarEventId,
      personId,
      handle: 'imported@example.com',
      createdAt: IMPORTED_AT,
    });
    await insert('timelineActivity', {
      targetPersonId: personId,
      happensAt: ASSIGNED_AT,
      properties: assignmentProperties(null, companyId),
    });
  });

  it('is pending in the automatic 2.43 upgrade until its cursor is completed', () => {
    const reader = getAppProviderByClassName<UpgradeSequenceReaderService>(
      'UpgradeSequenceReaderService',
    );
    const commands = reader
      .getUpgradeSequence()
      .filter((step) => step.kind === 'workspace')
      .filter((step) => step.version === '2.43.0');
    const repairIndex = commands.findIndex((step) => step.command === command);

    expect(repairIndex).toBeGreaterThan(0);
    const repair = commands[repairIndex];
    const precedingCommand = commands[repairIndex - 1];

    expect(repair.timestamp).toBeGreaterThan(precedingCommand.timestamp);
    expect(
      reader.getPendingWorkspaceCommands({
        workspaceCommands: commands,
        workspaceCursor: { name: precedingCommand.name, status: 'completed' },
      }),
    ).toContain(repair);
    expect(
      reader.getPendingWorkspaceCommands({
        workspaceCommands: commands,
        workspaceCursor: { name: repair.name, status: 'failed' },
      }),
    ).toContain(repair);
    expect(
      reader.getPendingWorkspaceCommands({
        workspaceCommands: commands,
        workspaceCursor: { name: repair.name, status: 'completed' },
      }),
    ).not.toContain(repair);
  });

  it('retains repaired history on rollback', async () => {
    await runRepair();
    const before = await Promise.all(TARGET_TABLE_NAMES.map(targets));

    await command.down({
      workspaceId,
      dataSource: global.testDataSource,
      options: {},
      index: 0,
      total: 1,
    });

    expect(await Promise.all(TARGET_TABLE_NAMES.map(targets))).toEqual(before);
  });

  it('previews missing links, repairs both histories, and preserves existing attribution on reruns', async () => {
    const otherCompanyId = await insert('company', {
      name: 'Manual attribution',
    });
    const automaticCompanyId = await insert('company', {
      name: 'Existing automatic attribution',
    });

    for (const tableName of TARGET_TABLE_NAMES) {
      await insert(tableName, {
        ...parent(tableName),
        targetCompanyId: otherCompanyId,
        isManuallyAssigned: true,
        isAutomaticallyAssigned: false,
      });
      await insert(tableName, {
        ...parent(tableName),
        targetCompanyId: automaticCompanyId,
        isManuallyAssigned: false,
        isAutomaticallyAssigned: true,
      });
    }
    const before = await Promise.all(TARGET_TABLE_NAMES.map(targets));

    await runRepair(true);
    expect(await Promise.all(TARGET_TABLE_NAMES.map(targets))).toEqual(before);
    expect(command['logger'].log).toHaveBeenCalledWith(
      `[DRY RUN] Would create 1 message thread company targets for workspace ${workspaceId}`,
    );
    expect(command['logger'].log).toHaveBeenCalledWith(
      `[DRY RUN] Would create 1 calendar event company targets for workspace ${workspaceId}`,
    );

    await runRepair();
    const after = await Promise.all(TARGET_TABLE_NAMES.map(targets));

    for (const [index, rows] of after.entries()) {
      expect(rows).toHaveLength(3);
      expect(rows).toEqual(
        expect.arrayContaining([
          ...before[index],
          expect.objectContaining({
            targetCompanyId: companyId,
            isAutomaticallyAssigned: true,
            isManuallyAssigned: false,
            deletedAt: null,
          }),
        ]),
      );
    }
    await runRepair();
    expect(await Promise.all(TARGET_TABLE_NAMES.map(targets))).toEqual(after);
  });

  it.each([false, true])(
    'preserves an existing target, including a tombstone (deleted=%s)',
    async (deleted) => {
      for (const tableName of TARGET_TABLE_NAMES) {
        await insert(tableName, {
          ...parent(tableName),
          targetCompanyId: companyId,
          isManuallyAssigned: true,
          isAutomaticallyAssigned: false,
          deletedAt: deleted ? ASSIGNED_AT : null,
        });
      }
      const before = await Promise.all(TARGET_TABLE_NAMES.map(targets));

      await runRepair();
      expect(await Promise.all(TARGET_TABLE_NAMES.map(targets))).toEqual(
        before,
      );
    },
  );

  it.each([
    'missing audit',
    'unknown previous company',
    'company move',
    'subsequent reassignment',
    'deleted audit',
    'linked record audit',
    'changed current company',
    'deleted person',
    'deleted company',
    'deleted participants',
    'deleted parents',
    'later participants',
  ])('skips unsupported history: %s', async (scenario) => {
    const anotherCompanyId = await insert('company', {});

    if (scenario === 'missing audit') {
      await global.testDataSource.query(
        `DELETE FROM "${schemaName}"."timelineActivity"`,
      );
    } else if (
      scenario === 'unknown previous company' ||
      scenario === 'company move'
    ) {
      const properties =
        scenario === 'company move'
          ? assignmentProperties(anotherCompanyId, companyId)
          : { diff: { company: { after: { id: companyId } } } };

      await global.testDataSource.query(
        `UPDATE "${schemaName}"."timelineActivity" SET properties = $1`,
        [properties],
      );
    } else if (scenario === 'subsequent reassignment') {
      await insert('timelineActivity', {
        targetPersonId: personId,
        happensAt: ASSIGNED_AT,
        properties: assignmentProperties(companyId, anotherCompanyId),
      });
    } else if (scenario === 'deleted audit') {
      await global.testDataSource.query(
        `UPDATE "${schemaName}"."timelineActivity" SET "deletedAt" = NOW()`,
      );
    } else if (scenario === 'linked record audit') {
      await global.testDataSource.query(
        `UPDATE "${schemaName}"."timelineActivity" SET "linkedRecordId" = $1`,
        [randomUUID()],
      );
    } else if (scenario === 'changed current company') {
      await global.testDataSource.query(
        `UPDATE "${schemaName}"."person" SET "companyId" = $1`,
        [anotherCompanyId],
      );
    } else {
      const tableNames =
        scenario === 'deleted person'
          ? ['person']
          : scenario === 'deleted company'
            ? ['company']
            : scenario === 'deleted parents'
              ? ['messageThread', 'calendarEvent']
              : ['messageParticipant', 'calendarEventParticipant'];

      for (const tableName of tableNames) {
        await global.testDataSource.query(
          `UPDATE "${schemaName}"."${tableName}" SET "${scenario === 'later participants' ? 'createdAt' : 'deletedAt'}" = NOW()`,
        );
      }
    }

    await runRepair();
    expect(await targets('messageThreadTarget')).toEqual([]);
    expect(await targets('calendarEventTarget')).toEqual([]);
  });

  it('ignores other records company changes linked onto the person timeline', async () => {
    await insert('timelineActivity', {
      targetPersonId: personId,
      linkedRecordId: randomUUID(),
      happensAt: ASSIGNED_AT,
      properties: assignmentProperties(randomUUID(), companyId),
    });
    await runRepair();

    for (const tableName of TARGET_TABLE_NAMES) {
      expect(await targets(tableName)).toEqual([
        expect.objectContaining({ targetCompanyId: companyId }),
      ]);
    }
  });

  it('deduplicates a company shared by multiple participants', async () => {
    const secondPersonId = await insert('person', {
      companyId,
      createdAt: IMPORTED_AT,
    });
    const [{ id: messageId }] = await global.testDataSource.query<
      Array<{ id: string }>
    >(`SELECT id FROM "${schemaName}"."message" LIMIT 1`);

    await insert('messageParticipant', {
      messageId,
      personId: secondPersonId,
      role: 'TO',
      handle: 'second@example.com',
      createdAt: IMPORTED_AT,
    });
    await insert('calendarEventParticipant', {
      calendarEventId,
      personId: secondPersonId,
      handle: 'second@example.com',
      createdAt: IMPORTED_AT,
    });
    await insert('timelineActivity', {
      targetPersonId: secondPersonId,
      happensAt: ASSIGNED_AT,
      properties: assignmentProperties(null, companyId),
    });
    await runRepair();

    for (const tableName of TARGET_TABLE_NAMES) {
      expect(await targets(tableName)).toEqual([
        expect.objectContaining({ targetCompanyId: companyId }),
      ]);
    }
  });

  it('skips an unprovisioned workspace without touching another workspace', async () => {
    const missingWorkspaceId = randomUUID();

    await command.runOnWorkspace({
      workspaceId: missingWorkspaceId,
      dataSource: global.testDataSource,
      options: {},
      index: 0,
      total: 1,
    });
    expect(command['logger'].warn).toHaveBeenCalledWith(
      `Skipping workspace ${missingWorkspaceId}: target or audit tables are not provisioned`,
    );
    expect(await targets('messageThreadTarget')).toEqual([]);
    expect(await targets('calendarEventTarget')).toEqual([]);
  });

  it('finishes more than one batch and does not duplicate targets on a rerun', async () => {
    await global.testDataSource.query(
      `WITH threads AS (
      INSERT INTO "${schemaName}"."messageThread" (id) SELECT gen_random_uuid() FROM generate_series(1, 5001) RETURNING id
    ), messages AS (
      INSERT INTO "${schemaName}"."message" (id, "messageThreadId", "receivedAt")
      SELECT gen_random_uuid(), id, $2::timestamptz FROM threads RETURNING id
    ) INSERT INTO "${schemaName}"."messageParticipant" ("messageId", "personId", role, handle, "createdAt")
      SELECT id, $1::uuid, 'FROM', 'imported@example.com', $2::timestamptz FROM messages`,
      [personId, IMPORTED_AT],
    );
    await global.testDataSource.query(
      `WITH events AS (
      INSERT INTO "${schemaName}"."calendarEvent" (id, "startsAt")
      SELECT gen_random_uuid(), $2::timestamptz FROM generate_series(1, 5001) RETURNING id
    ) INSERT INTO "${schemaName}"."calendarEventParticipant" ("calendarEventId", "personId", handle, "createdAt")
      SELECT id, $1::uuid, 'imported@example.com', $2::timestamptz FROM events`,
      [personId, IMPORTED_AT],
    );

    await runRepair();
    const after = await Promise.all(TARGET_TABLE_NAMES.map(targets));

    expect(after.map((rows) => rows.length)).toEqual([5002, 5002]);
    await runRepair();
    expect(await Promise.all(TARGET_TABLE_NAMES.map(targets))).toEqual(after);
  });
});
